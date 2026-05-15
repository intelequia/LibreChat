import { logger } from '@librechat/data-schemas';
import { ErrorTypes } from 'librechat-data-provider';
import { isEnabled } from '~/utils';
import type { IUser, UserMethods } from '@librechat/data-schemas';

/**
 * Finds or migrates a user for OpenID authentication
 * @returns user object (with migration fields if needed), error message, and whether migration is needed
 */
export async function findOpenIDUser({
  openidId,
  findUser,
  email,
  idOnTheSource,
  strategyName = 'openid',
}: {
  openidId: string;
  findUser: UserMethods['findUser'];
  email?: string;
  idOnTheSource?: string;
  strategyName?: string;
}): Promise<{ user: IUser | null; error: string | null; migration: boolean }> {
  const primaryConditions = [];

  if (openidId && typeof openidId === 'string') {
    primaryConditions.push({ openidId });
  }

  if (idOnTheSource && typeof idOnTheSource === 'string') {
    primaryConditions.push({ idOnTheSource });
  }

  let user = null;
  if (primaryConditions.length > 0) {
    user = await findUser({ $or: primaryConditions });
  }
  if (!user && email) {
    user = await findUser({ email });
    logger.warn(
      `[${strategyName}] user ${user ? 'found' : 'not found'} with email: ${email} for openidId: ${openidId}`,
    );

    // If user found by email, check if they're allowed to use OpenID provider
    if (user && user.provider && user.provider !== 'openid') {
      logger.warn(
        `[${strategyName}] Attempted OpenID login by user ${user.email}, was registered with "${user.provider}" provider`,
      );
      return { user: null, error: ErrorTypes.AUTH_FAILED, migration: false };
    }

    if (user?.openidId && user.openidId !== openidId) {
      if (isEnabled(process.env.OPENID_ALLOW_MULTI_ISSUER)) {
        logger.info(
          `[${strategyName}] openidId mismatch for ${user.email} allowed by OPENID_ALLOW_MULTI_ISSUER (stored: ${user.openidId}, token: ${openidId})`,
        );
        return { user, error: null, migration: false };
      }
      logger.warn(
        `[${strategyName}] Rejected email fallback for ${user.email}: stored openidId does not match token sub`,
      );
      return { user: null, error: ErrorTypes.AUTH_FAILED, migration: false };
    }

    if (user && !user.openidId) {
      logger.info(
        `[${strategyName}] Preparing user ${user.email} for migration to OpenID with sub: ${openidId}`,
      );
      user.provider = 'openid';
      user.openidId = openidId;
      return { user, error: null, migration: true };
    }
  }

  return { user, error: null, migration: false };
}
