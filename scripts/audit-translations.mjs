#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import jsYaml from 'js-yaml';
import { AzureOpenAI } from 'openai';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const englishPath = path.join(rootDir, 'client', 'src', 'locales', 'en', 'translation.json');
const spanishPath = path.join(rootDir, 'client', 'src', 'locales', 'es', 'translation.json');
const librechatConfigPath = path.join(rootDir, 'librechat.yaml');
const placeholderPattern = /\{\{[^{}]+\}\}|\{[^{}]+\}|%[-+0-9.#]*[a-zA-Z]/g;
const defaultBatchSize = 40;
const defaultModelName = 'gpt-4.1-nano';

dotenv.config({ path: path.join(rootDir, '.env') });

function usage() {
  console.log(`Usage: npm run audit:translations -- [options]

Options:
  --azure                  Ask Azure OpenAI to review Spanish values semantically
  --only-suspicious        With --azure, review only locally flagged values
  --translate-missing      Translate missing English keys into Spanish with Azure
  --model <deployment>     Azure deployment; defaults to the YAML gpt-4.1-nano deployment
  --batch-size <number>    Azure request batch size (default: ${defaultBatchSize})
  --limit <number>         Limit the number of values sent to Azure
  --key <key[,key...]>     Limit the report and Azure review to selected keys
  --output <file>          Write the complete report as JSON
  --translation-output <file>
                           Write the translated Spanish catalog to this path
  --strict                 Exit with code 1 when issues are found
  --verbose                Print more examples in the console
  --help                   Show this help

Examples:
  npm run audit:translations
  npm run audit:translations -- --azure --only-suspicious --output translation-audit.json
  npm run audit:translations -- --azure --translate-missing
  npm run audit:translations -- --azure --key com_nav_go_to_admin_panel`);
}

function parseArgs(argumentsList) {
  const options = {
    azure: false,
    onlySuspicious: false,
    translateMissing: false,
    model: undefined,
    batchSize: defaultBatchSize,
    limit: undefined,
    keys: [],
    output: undefined,
    translationOutput: undefined,
    strict: false,
    verbose: false,
  };
  const valueOptions = new Set([
    'model',
    'batch-size',
    'limit',
    'key',
    'output',
    'translation-output',
  ]);

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === '--help') {
      usage();
      process.exit(0);
    }
    if (argument === '--azure') {
      options.azure = true;
      continue;
    }
    if (argument === '--only-suspicious') {
      options.onlySuspicious = true;
      continue;
    }
    if (argument === '--translate-missing') {
      options.translateMissing = true;
      continue;
    }
    if (argument === '--strict') {
      options.strict = true;
      continue;
    }
    if (argument === '--verbose') {
      options.verbose = true;
      continue;
    }
    if (!argument.startsWith('--')) {
      throw new Error(`Unknown argument: ${argument}`);
    }

    const name = argument.slice(2);
    if (!valueOptions.has(name)) {
      throw new Error(`Unknown option: ${argument}`);
    }

    const value = argumentsList[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${argument}`);
    }
    index += 1;

    if (name === 'model') options.model = value;
    if (name === 'batch-size') options.batchSize = parsePositiveInteger(value, argument);
    if (name === 'limit') options.limit = parsePositiveInteger(value, argument);
    if (name === 'key') {
      options.keys.push(
        ...value
          .split(',')
          .map((key) => key.trim())
          .filter(Boolean),
      );
    }
    if (name === 'output') options.output = value;
    if (name === 'translation-output') options.translationOutput = value;
  }

  return options;
}

function parsePositiveInteger(value, option) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${option} must be a positive integer`);
  }
  return parsed;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function flatten(value, prefix = '', output = new Map()) {
  if (isObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, output);
    }
  } else if (prefix) {
    output.set(prefix, value);
  }
  return output;
}

async function loadCatalog(filePath) {
  const parsed = await loadJsonObject(filePath);
  return flatten(parsed);
}

async function loadJsonObject(filePath) {
  const parsed = JSON.parse(await readFile(filePath, 'utf8'));
  if (!isObject(parsed)) {
    throw new Error(`${path.relative(rootDir, filePath)} must contain a JSON object`);
  }
  return parsed;
}

function placeholderSignature(value) {
  return (value.match(placeholderPattern) ?? []).sort().join('\u0000');
}

function protectPlaceholders(value) {
  const placeholders = value.match(placeholderPattern) ?? [];
  let protectedValue = value;
  for (let index = 0; index < placeholders.length; index += 1) {
    protectedValue = protectedValue.replace(
      placeholders[index],
      `__LIBRECHAT_PLACEHOLDER_${index}__`,
    );
  }
  return { value: protectedValue, placeholders };
}

function restorePlaceholders(value, placeholders) {
  return value.replace(
    /__LIBRECHAT_PLACEHOLDER_(\d+)__/gu,
    (token, indexText) => placeholders[Number.parseInt(indexText, 10)] ?? token,
  );
}

function normalizeForComparison(value) {
  return value.trim().replace(/\s+/gu, ' ');
}

function analyzeLocalValue(key, englishValue, spanishValue) {
  const flags = [];
  if (typeof spanishValue !== 'string') {
    flags.push('non_string_spanish_value');
    return flags;
  }
  if (!spanishValue.trim()) flags.push('empty_spanish_value');
  if (typeof englishValue === 'string') {
    if (normalizeForComparison(englishValue) === normalizeForComparison(spanishValue)) {
      flags.push('same_as_english');
    }
    if (normalizeForComparison(spanishValue) === key) flags.push('key_used_as_value');
    if (placeholderSignature(englishValue) !== placeholderSignature(spanishValue)) {
      flags.push('placeholder_mismatch');
    }
  }
  return flags;
}

function getAzureEndpoint() {
  const configuredEndpoint =
    process.env.AZURE_OPENAI_ENDPOINT || process.env.AZURE_OPENAI_API_BASE || undefined;
  const resourceName =
    process.env.AZURE_OPENAI_RESOURCE_NAME || process.env.AZURE_OPENAI_INSTANCE_NAME;
  const endpoint =
    configuredEndpoint || (resourceName ? `https://${resourceName}.openai.azure.com` : '');
  return endpoint.replace(/\/+$/u, '').replace(/\/openai\/v1$/u, '');
}

async function loadAzureDeployment(requestedModel) {
  let config;
  try {
    config = jsYaml.load(await readFile(librechatConfigPath, 'utf8'));
  } catch (error) {
    throw new Error(`Could not read librechat.yaml: ${error.message}`);
  }

  const groups = config?.endpoints?.azureOpenAI?.groups;
  const group = Array.isArray(groups) ? groups.find(isObject) : undefined;
  const models = isObject(group?.models) ? group.models : {};
  const requested =
    requestedModel ||
    process.env.TRANSLATION_AZURE_DEPLOYMENT ||
    process.env.AZURE_OPENAI_TRANSLATION_DEPLOYMENT ||
    process.env.TRANSLATION_AZURE_MODEL;

  if (requested) {
    const configuredModel = models[requested];
    if (isObject(configuredModel) && typeof configuredModel.deploymentName === 'string') {
      return configuredModel.deploymentName;
    }
    return requested;
  }

  const preferredModel = models[defaultModelName];
  if (isObject(preferredModel) && typeof preferredModel.deploymentName === 'string') {
    return preferredModel.deploymentName;
  }

  for (const model of Object.values(models)) {
    if (isObject(model) && typeof model.deploymentName === 'string') {
      return model.deploymentName;
    }
  }

  throw new Error('No Azure OpenAI deployment was found in librechat.yaml');
}

async function createAzureReviewer(requestedModel) {
  const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.AZURE_API_KEY;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
  const endpoint = getAzureEndpoint();
  if (!apiKey) throw new Error('AZURE_OPENAI_API_KEY or AZURE_API_KEY is missing from .env');
  if (!apiVersion) throw new Error('AZURE_OPENAI_API_VERSION is missing from .env');
  if (!endpoint) {
    throw new Error('AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_RESOURCE_NAME is missing from .env');
  }

  const deployment = await loadAzureDeployment(requestedModel);
  const client = new AzureOpenAI({ apiKey, apiVersion, endpoint, deployment });
  return { client, deployment };
}

function chunk(values, size) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function parseModelJson(content) {
  const trimmed = content
    .trim()
    .replace(/^```(?:json)?\s*/iu, '')
    .replace(/\s*```$/u, '');
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('Azure response did not contain a JSON object');
  return JSON.parse(trimmed.slice(start, end + 1));
}

async function reviewBatch(client, deployment, entries) {
  const response = await client.chat.completions.create({
    model: deployment,
    messages: [
      {
        role: 'system',
        content:
          'You audit an English to Spanish localization catalog. For every item, set translated to true when the Spanish value conveys the same meaning, even if the wording is imperfect. Set translated to false only when the value is blank, still English prose, materially wrong, missing important meaning, or has a broken placeholder. Keep unchanged product names, proper names, acronyms, code, URLs, placeholders, language names, and universally used technical terms as translated when appropriate. Do not set translated to false merely because a phrase is literal, a cognate, or unchanged. Return only JSON in the form {"reviews":[{"key":"...","translated":true,"confidence":"high|low","reason":"short explanation"}]} and include every key exactly once.',
      },
      {
        role: 'user',
        content: JSON.stringify(entries),
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
  });
  const content = response.choices[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Azure response contained no review content');
  }
  const parsed = parseModelJson(content);
  if (!Array.isArray(parsed.reviews)) throw new Error('Azure response has no reviews array');

  const expectedKeys = new Set(entries.map((entry) => entry.key));
  const reviews = new Map();
  for (const review of parsed.reviews) {
    if (!isObject(review) || !expectedKeys.has(review.key)) continue;
    const translated =
      review.translated === true || review.translated === 'true' || review.status === 'translated';
    const explicitlyUntranslated =
      review.translated === false ||
      review.translated === 'false' ||
      review.status === 'untranslated' ||
      review.status === 'needs_review';
    let status = 'uncertain';
    if (translated) status = 'translated';
    else if (explicitlyUntranslated) status = 'untranslated';
    const lowConfidence = review.confidence === 'low';
    reviews.set(review.key, {
      status: status === 'translated' && lowConfidence ? 'uncertain' : status,
      reason: typeof review.reason === 'string' ? review.reason : 'No reason provided',
    });
  }
  return reviews;
}

async function translateBatch(client, deployment, entries) {
  if (entries.some((entry) => typeof entry.english !== 'string')) {
    throw new Error('Azure translation requires every English value to be a string');
  }

  const protectedEntries = entries.map((entry) => {
    const protectedValue = protectPlaceholders(entry.english);
    return { ...entry, english: protectedValue.value };
  });
  const response = await client.chat.completions.create({
    model: deployment,
    messages: [
      {
        role: 'system',
        content:
          'You translate English UI localization values into natural, concise, neutral international Spanish. Return only JSON in the form {"translations":[{"key":"...","spanish":"..."}]} and include every key exactly once. Preserve every placeholder exactly, including {{name}}, {{0}}, {name}, and printf-style placeholders such as %s. Preserve URLs, code, markup, escape sequences, and line breaks when present. Translate the meaning of the complete English value; do not omit details. Keep product names, proper names, acronyms, and established technical terms unchanged when appropriate. Do not add explanations outside the JSON.',
      },
      {
        role: 'user',
        content: JSON.stringify(protectedEntries),
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
  });
  const content = response.choices[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Azure response contained no translation content');
  }
  const parsed = parseModelJson(content);
  if (!Array.isArray(parsed.translations)) {
    throw new Error('Azure response has no translations array');
  }

  const expectedKeys = new Set(entries.map((entry) => entry.key));
  const placeholdersByKey = new Map(
    entries.map((entry) => [entry.key, protectPlaceholders(entry.english).placeholders]),
  );
  const translations = new Map();
  for (const translation of parsed.translations) {
    if (!isObject(translation) || !expectedKeys.has(translation.key)) {
      throw new Error('Azure response contained an unexpected translation key');
    }
    if (translations.has(translation.key)) {
      throw new Error(`Azure response duplicated translation key: ${translation.key}`);
    }
    if (typeof translation.spanish !== 'string' || !translation.spanish.trim()) {
      throw new Error(`Azure returned an empty translation for ${translation.key}`);
    }
    translations.set(
      translation.key,
      restorePlaceholders(translation.spanish, placeholdersByKey.get(translation.key) ?? []),
    );
  }

  const missingKeys = entries
    .filter((entry) => !translations.has(entry.key))
    .map((entry) => entry.key);
  if (missingKeys.length > 0) {
    throw new Error(`Azure omitted translations: ${missingKeys.join(', ')}`);
  }

  for (const entry of entries) {
    const spanishValue = translations.get(entry.key);
    if (placeholderSignature(entry.english) !== placeholderSignature(spanishValue)) {
      throw new Error(`Azure changed placeholders for ${entry.key}`);
    }
  }
  return translations;
}

async function translateBatchWithFallback(client, deployment, entries) {
  try {
    return await translateBatch(client, deployment, entries);
  } catch (error) {
    if (entries.length === 1) {
      try {
        return await translateBatch(client, deployment, entries);
      } catch (retryError) {
        throw new Error(`${retryError.message} (initial error: ${error.message})`);
      }
    }

    const midpoint = Math.ceil(entries.length / 2);
    const translations = new Map();
    const parts = [entries.slice(0, midpoint), entries.slice(midpoint)];
    for (const part of parts) {
      const partTranslations = await translateBatchWithFallback(client, deployment, part);
      for (const [key, translation] of partTranslations) translations.set(key, translation);
    }
    return translations;
  }
}

async function reviewWithAzure(entries, options) {
  const reviewer = await createAzureReviewer(options.model);
  const batches = chunk(entries, options.batchSize);
  const reviews = new Map();
  const errors = [];

  console.log(
    `Azure review: ${entries.length} value(s) in ${batches.length} batch(es) using ${reviewer.deployment}`,
  );
  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    try {
      const batchReviews = await reviewBatch(reviewer.client, reviewer.deployment, batch);
      const missingEntries = batch.filter((entry) => !batchReviews.has(entry.key));
      if (missingEntries.length > 0) {
        try {
          const retryReviews = await reviewBatch(
            reviewer.client,
            reviewer.deployment,
            missingEntries,
          );
          for (const [key, review] of retryReviews) batchReviews.set(key, review);
        } catch (error) {
          errors.push(`batch ${index + 1} retry: ${error.message}`);
        }
      }
      for (const [key, review] of batchReviews) reviews.set(key, review);
      if (batchReviews.size !== batch.length) {
        errors.push(
          `batch ${index + 1}: Azure returned ${batchReviews.size} of ${batch.length} expected reviews`,
        );
      }
    } catch (error) {
      errors.push(`batch ${index + 1}: ${error.message}`);
    }
  }

  return { deployment: reviewer.deployment, reviews, errors };
}

async function translateWithAzure(entries, options) {
  const reviewer = await createAzureReviewer(options.model);
  const batches = chunk(entries, options.batchSize);
  const translations = new Map();
  const errors = [];

  console.log(
    `Azure translation: ${entries.length} value(s) in ${batches.length} batch(es) using ${reviewer.deployment}`,
  );
  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    try {
      const batchTranslations = await translateBatchWithFallback(
        reviewer.client,
        reviewer.deployment,
        batch,
      );
      for (const [key, translation] of batchTranslations) translations.set(key, translation);
    } catch (error) {
      errors.push(`batch ${index + 1}: ${error.message}`);
    }
  }

  return { deployment: reviewer.deployment, translations, errors };
}

function selectedKey(key, options) {
  return options.keys.length === 0 || options.keys.includes(key);
}

function issueRecord(key, englishValue, spanishValue, localFlags = []) {
  return {
    key,
    english: englishValue,
    spanish: spanishValue,
    localFlags,
  };
}

function buildLocalReport(englishValues, spanishValues, options) {
  const report = {
    source: {
      english: path.relative(rootDir, englishPath),
      spanish: path.relative(rootDir, spanishPath),
    },
    counts: {
      englishKeys: 0,
      spanishKeys: 0,
      overlappingKeys: 0,
      missingInSpanish: 0,
      extraInSpanish: 0,
      emptySpanish: 0,
      sameAsEnglish: 0,
      keyUsedAsValue: 0,
      placeholderMismatches: 0,
      nonStringValues: 0,
    },
    missingInSpanish: [],
    extraInSpanish: [],
    emptySpanish: [],
    sameAsEnglish: [],
    keyUsedAsValue: [],
    placeholderMismatches: [],
    nonStringValues: [],
    sharedEntries: [],
    ai: {
      enabled: options.azure && !options.translateMissing,
      onlySuspicious: options.onlySuspicious,
      requested: 0,
      reviewed: 0,
      untranslated: [],
      uncertain: [],
      errors: [],
    },
    translation: {
      enabled: options.translateMissing,
      requested: 0,
      translated: 0,
      output: undefined,
      errors: [],
    },
  };

  report.counts.englishKeys = [...englishValues.keys()].filter((key) =>
    selectedKey(key, options),
  ).length;
  report.counts.spanishKeys = [...spanishValues.keys()].filter((key) =>
    selectedKey(key, options),
  ).length;

  for (const [key, englishValue] of englishValues) {
    if (!selectedKey(key, options)) continue;
    if (!spanishValues.has(key)) {
      report.missingInSpanish.push({ key, english: englishValue });
      continue;
    }

    const spanishValue = spanishValues.get(key);
    report.counts.overlappingKeys += 1;
    const localFlags = analyzeLocalValue(key, englishValue, spanishValue);
    const entry = { key, english: englishValue, spanish: spanishValue, localFlags };
    report.sharedEntries.push(entry);

    if (typeof englishValue !== 'string' || typeof spanishValue !== 'string') {
      report.nonStringValues.push(issueRecord(key, englishValue, spanishValue, localFlags));
    }
    if (localFlags.includes('empty_spanish_value')) {
      report.emptySpanish.push(issueRecord(key, englishValue, spanishValue, localFlags));
    }
    if (localFlags.includes('same_as_english')) {
      report.sameAsEnglish.push(issueRecord(key, englishValue, spanishValue, localFlags));
    }
    if (localFlags.includes('key_used_as_value')) {
      report.keyUsedAsValue.push(issueRecord(key, englishValue, spanishValue, localFlags));
    }
    if (localFlags.includes('placeholder_mismatch')) {
      report.placeholderMismatches.push(issueRecord(key, englishValue, spanishValue, localFlags));
    }
  }

  for (const [key, spanishValue] of spanishValues) {
    if (selectedKey(key, options) && !englishValues.has(key)) {
      report.extraInSpanish.push({ key, spanish: spanishValue });
    }
  }

  report.counts.missingInSpanish = report.missingInSpanish.length;
  report.counts.extraInSpanish = report.extraInSpanish.length;
  report.counts.emptySpanish = report.emptySpanish.length;
  report.counts.sameAsEnglish = report.sameAsEnglish.length;
  report.counts.keyUsedAsValue = report.keyUsedAsValue.length;
  report.counts.placeholderMismatches = report.placeholderMismatches.length;
  report.counts.nonStringValues = report.nonStringValues.length;
  return report;
}

function displayValue(value) {
  if (typeof value !== 'string') return String(value);
  const singleLine = value.replace(/\s+/gu, ' ').trim();
  return singleLine.length > 140 ? `${singleLine.slice(0, 137)}...` : singleLine;
}

function printExamples(title, entries, formatEntry, verbose) {
  if (entries.length === 0) return;
  const visibleEntries = verbose ? entries : entries.slice(0, 12);
  console.log(`${title}: ${entries.length}`);
  for (const entry of visibleEntries) console.log(`  - ${formatEntry(entry)}`);
  if (visibleEntries.length < entries.length) {
    console.log(`  ... ${entries.length - visibleEntries.length} more; use --verbose or --output`);
  }
}

function printSummary(report, options) {
  console.log('Translation audit: English -> Spanish');
  console.log(`English keys: ${report.counts.englishKeys}`);
  console.log(`Spanish keys: ${report.counts.spanishKeys}`);
  console.log(`Shared keys: ${report.counts.overlappingKeys}`);
  printExamples(
    'Missing in Spanish',
    report.missingInSpanish,
    (entry) => entry.key,
    options.verbose,
  );
  printExamples('Extra in Spanish', report.extraInSpanish, (entry) => entry.key, options.verbose);
  printExamples(
    'Empty Spanish values',
    report.emptySpanish,
    (entry) => `${entry.key}: ${displayValue(entry.english)}`,
    options.verbose,
  );
  printExamples(
    'Same as English',
    report.sameAsEnglish,
    (entry) => `${entry.key}: ${displayValue(entry.english)}`,
    options.verbose,
  );
  printExamples(
    'Placeholder mismatches',
    report.placeholderMismatches,
    (entry) => `${entry.key}: ${displayValue(entry.english)} -> ${displayValue(entry.spanish)}`,
    options.verbose,
  );

  if (report.ai.enabled) {
    console.log(`Azure reviewed: ${report.ai.reviewed}/${report.ai.requested}`);
    printExamples(
      'Azure marked untranslated',
      report.ai.untranslated,
      (entry) => `${entry.key}: ${entry.reason}`,
      options.verbose,
    );
    printExamples(
      'Azure marked uncertain',
      report.ai.uncertain,
      (entry) => `${entry.key}: ${entry.reason}`,
      options.verbose,
    );
    if (report.ai.errors.length) {
      console.log(`Azure errors: ${report.ai.errors.length}`);
      for (const error of report.ai.errors) console.log(`  - ${error}`);
    }
  }

  if (report.translation?.enabled) {
    console.log(
      `Azure translated: ${report.translation.translated}/${report.translation.requested}`,
    );
    if (report.translation.output) {
      console.log(`Translated catalog: ${report.translation.output}`);
    }
    if (report.translation.errors.length) {
      console.log(`Azure translation errors: ${report.translation.errors.length}`);
      for (const error of report.translation.errors) console.log(`  - ${error}`);
    }
  }
}

function hasIssues(report) {
  return Boolean(
    report.counts.missingInSpanish ||
      report.counts.extraInSpanish ||
      report.counts.emptySpanish ||
      report.counts.keyUsedAsValue ||
      report.counts.placeholderMismatches ||
      report.counts.nonStringValues ||
      report.ai.untranslated.length ||
      report.ai.uncertain.length ||
      report.ai.errors.length ||
      report.translation?.errors?.length,
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.translateMissing && !options.azure) {
    throw new Error('--translate-missing requires --azure');
  }
  const [englishValues, spanishValues] = await Promise.all([
    loadCatalog(englishPath),
    loadCatalog(spanishPath),
  ]);
  let report = buildLocalReport(englishValues, spanishValues, options);

  if (report.ai.enabled) {
    let candidates = report.sharedEntries.filter(
      (entry) => !options.onlySuspicious || entry.localFlags.length > 0,
    );
    if (options.limit) candidates = candidates.slice(0, options.limit);
    report.ai.requested = candidates.length;
    if (candidates.length > 0) {
      const azureResult = await reviewWithAzure(candidates, options);
      report.ai.deployment = azureResult.deployment;
      report.ai.errors = azureResult.errors;
      for (const entry of candidates) {
        const review = azureResult.reviews.get(entry.key);
        if (!review) continue;
        report.ai.reviewed += 1;
        if (review.status === 'untranslated' || review.status === 'uncertain') {
          const issue = {
            ...issueRecord(entry.key, entry.english, entry.spanish, entry.localFlags),
            status: review.status,
            reason: review.reason,
          };
          report.ai[review.status].push(issue);
        }
      }
    }
  }

  if (options.translateMissing) {
    let candidates = report.missingInSpanish;
    if (options.limit) candidates = candidates.slice(0, options.limit);
    report.translation.requested = candidates.length;
    if (candidates.length > 0) {
      const translationResult = await translateWithAzure(candidates, options);
      report.translation.errors = translationResult.errors;
      if (translationResult.errors.length > 0) {
        throw new Error(`Azure translation failed: ${translationResult.errors.join('; ')}`);
      }

      const spanishCatalog = await loadJsonObject(spanishPath);
      for (const entry of candidates) {
        const spanishValue = translationResult.translations.get(entry.key);
        if (typeof spanishValue !== 'string') {
          throw new Error(`Azure did not return a translation for ${entry.key}`);
        }
        spanishCatalog[entry.key] = spanishValue;
      }

      const outputPath = options.translationOutput
        ? path.resolve(process.cwd(), options.translationOutput)
        : spanishPath;
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, `${JSON.stringify(spanishCatalog, null, 2)}\n`);
      report.translation.translated = candidates.length;
      report.translation.output = path.relative(rootDir, outputPath);

      const translatedSpanishValues = await loadCatalog(outputPath);
      const translatedReport = buildLocalReport(englishValues, translatedSpanishValues, options);
      translatedReport.translation = report.translation;
      report = translatedReport;
    }
  }

  if (options.output) {
    const outputPath = path.resolve(process.cwd(), options.output);
    report.output = path.relative(rootDir, outputPath);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  }

  printSummary(report, options);
  if (options.output) console.log(`Complete report: ${report.output}`);
  if (options.strict && hasIssues(report)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Translation audit failed: ${error.message}`);
  process.exitCode = 2;
});
