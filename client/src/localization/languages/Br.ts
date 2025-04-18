// Portuguese phrases
// file deepcode ignore NoHardcodedPasswords: No hardcoded values present in this file
// file deepcode ignore HardcodedNonCryptoSecret: No hardcoded secrets present in this file

export default {
  com_nav_convo_menu_options: 'Opções do Menu de Conversa',
  com_ui_artifacts: 'Artefatos',
  com_ui_artifacts_toggle: 'Alternar UI de Artefatos',
  com_nav_info_code_artifacts:
    'Habilita a exibição de artefatos de código experimental ao lado do chat',
  com_ui_include_shadcnui: 'Incluir instruções de componentes shadcn/ui',
  com_nav_info_include_shadcnui:
    'Quando habilitado, as instruções para usar componentes shadcn/ui serão incluídas. shadcn/ui é uma coleção de componentes reutilizáveis construídos usando Radix UI e Tailwind CSS. Nota: estas são instruções longas, você deve habilitar apenas se for importante informar o LLM sobre as importações e componentes corretos. Para mais informações sobre esses componentes, visite: https://ui.shadcn.com/',
  com_ui_custom_prompt_mode: 'Modo de Prompt Personalizado',
  com_nav_info_custom_prompt_mode:
    'Quando habilitado, o prompt padrão do sistema de artefatos não será incluído. Todas as instruções de geração de artefatos devem ser fornecidas manualmente neste modo.',
  com_ui_artifact_click: 'Clique para abrir',
  com_a11y_start: 'A IA começou a responder.',
  com_a11y_ai_composing: 'A IA ainda está compondo.',
  com_a11y_end: 'A IA terminou de responder.',
  com_error_moderation:
    'Parece que o conteúdo enviado foi sinalizado pelo nosso sistema de moderação por não estar alinhado com nossas diretrizes da comunidade. Não podemos prosseguir com este tópico específico. Se você tiver outras perguntas ou tópicos que gostaria de explorar, edite sua mensagem ou crie uma nova conversa.',
  com_error_no_user_key:
    'Nenhuma chave encontrada. Por favor, forneça uma chave e tente novamente.',
  com_error_no_base_url: 'Nenhuma URL base encontrada. Por favor, forneça uma e tente novamente.',
  com_error_invalid_user_key:
    'Chave fornecida inválida. Por favor, forneça uma chave válida e tente novamente.',
  com_error_expired_user_key:
    'A chave fornecida para {0} expirou em {1}. Por favor, forneça uma nova chave e tente novamente.',
  com_error_input_length:
    'A contagem de tokens da última mensagem é muito longa, excedendo o limite de tokens ({0} respectivamente). Por favor, encurte sua mensagem, ajuste o tamanho máximo do contexto nos parâmetros da conversa ou divida a conversa para continuar.',
  com_files_no_results: 'Nenhum resultado.',
  com_files_filter: 'Filtrar arquivos...',
  com_files_number_selected: '{0} de {1} arquivo(s) selecionado(s)',
  com_sidepanel_select_assistant: 'Selecionar um Assistente',
  com_sidepanel_parameters: 'Parâmetros',
  com_sidepanel_assistant_builder: 'Construtor de Assistente',
  com_sidepanel_hide_panel: 'Ocultar Painel',
  com_sidepanel_attach_files: 'Anexar Arquivos',
  com_sidepanel_manage_files: 'Gerenciar Arquivos',
  com_sidepanel_conversation_tags: 'Marcadores',
  com_assistants_capabilities: 'Capacidades',
  com_assistants_file_search: 'Pesquisa de Arquivos',
  com_assistants_file_search_info:
    'A pesquisa de arquivos permite que o assistente tenha conhecimento dos arquivos que você ou seus usuários carregam. Uma vez que um arquivo é carregado, o assistente decide automaticamente quando recuperar o conteúdo com base nas solicitações do usuário. Anexar armazenamentos vetoriais para Pesquisa de Arquivos ainda não é suportado. Você pode anexá-los no Playground do Provedor ou anexar arquivos às mensagens para pesquisa de arquivos em uma base de thread.',
  com_assistants_code_interpreter_info:
    'O Interpretador de Código permite que o assistente escreva e execute código. Esta ferramenta pode processar arquivos com dados e formatações diversas, e gerar arquivos como gráficos.',
  com_assistants_knowledge: 'Conhecimento',
  com_assistants_knowledge_info:
    'Se você carregar arquivos em Conhecimento, as conversas com seu Assistente podem incluir o conteúdo dos arquivos.',
  com_assistants_knowledge_disabled:
    'O assistente deve ser criado, e o Interpretador de Código ou Recuperação deve ser habilitado e salvo antes de carregar arquivos como Conhecimento.',
  com_assistants_image_vision: 'Visão de Imagem',
  com_assistants_append_date: 'Anexar Data e Hora Atual',
  com_assistants_append_date_tooltip:
    'Quando ativado, a data e hora atual do cliente serão anexadas às instruções do sistema do assistente.',
  com_assistants_code_interpreter: 'Interpretador de Código',
  com_assistants_code_interpreter_files:
    'Os arquivos abaixo são apenas para o Interpretador de Código:',
  com_assistants_retrieval: 'Recuperação',
  com_assistants_search_name: 'Pesquisar assistentes por nome',
  com_ui_tools: 'Ferramentas',
  com_assistants_actions: 'Ações',
  com_assistants_add_tools: 'Adicionar Ferramentas',
  com_assistants_add_actions: 'Adicionar Ações',
  com_assistants_non_retrieval_model:
    'A pesquisa de arquivos não está habilitada neste modelo. Por favor, selecione outro modelo.',
  com_assistants_available_actions: 'Ações Disponíveis',
  com_assistants_running_action: 'Executando ação',
  com_assistants_completed_action: 'Conversou com {0}',
  com_assistants_completed_function: 'Executou {0}',
  com_assistants_function_use: 'Assistente usou {0}',
  com_assistants_domain_info: 'Assistente enviou esta informação para {0}',
  com_assistants_delete_actions_success: 'Ação excluída com sucesso do Assistente',
  com_assistants_update_actions_success: 'Ação criada ou atualizada com sucesso',
  com_assistants_update_actions_error: 'Houve um erro ao criar ou atualizar a ação.',
  com_assistants_delete_actions_error: 'Houve um erro ao excluir a ação.',
  com_assistants_actions_info:
    'Permita que seu Assistente recupere informações ou execute ações via API\'s',
  com_assistants_name_placeholder: 'Opcional: O nome do assistente',
  com_assistants_instructions_placeholder: 'As instruções do sistema que o assistente usa',
  com_assistants_description_placeholder: 'Opcional: Descreva seu Assistente aqui',
  com_assistants_actions_disabled: 'Você precisa criar um assistente antes de adicionar ações.',
  com_assistants_update_success: 'Atualizado com sucesso',
  com_assistants_update_error: 'Houve um erro ao atualizar seu assistente.',
  com_assistants_create_success: 'Criado com sucesso',
  com_assistants_create_error: 'Houve um erro ao criar seu assistente.',
  com_assistants_conversation_starters: 'Iniciadores de Conversa',
  com_assistants_conversation_starters_placeholder: 'Digite um iniciador de conversa',
  com_sidepanel_agent_builder: 'Construtor de Agente',
  com_agents_name_placeholder: 'Opcional: O nome do agente',
  com_agents_description_placeholder: 'Opcional: Descreva seu Agente aqui',
  com_agents_instructions_placeholder: 'As instruções do sistema que o agente usa',
  com_agents_search_name: 'Pesquisar agentes por nome',
  com_agents_update_error: 'Houve um erro ao atualizar seu agente.',
  com_agents_create_error: 'Houve um erro ao criar seu agente.',
  com_ui_date_today: 'Hoje',
  com_ui_date_yesterday: 'Ontem',
  com_ui_date_previous_7_days: 'Últimos 7 dias',
  com_ui_date_previous_30_days: 'Últimos 30 dias',
  com_ui_date_january: 'Janeiro',
  com_ui_date_february: 'Fevereiro',
  com_ui_date_march: 'Março',
  com_ui_date_april: 'Abril',
  com_ui_date_may: 'Maio',
  com_ui_date_june: 'Junho',
  com_ui_date_july: 'Julho',
  com_ui_date_august: 'Agosto',
  com_ui_date_september: 'Setembro',
  com_ui_date_october: 'Outubro',
  com_ui_date_november: 'Novembro',
  com_ui_date_december: 'Dezembro',
  com_ui_field_required: 'Este campo é obrigatório',
  com_ui_download_error: 'Erro ao baixar o arquivo. O arquivo pode ter sido excluído.',
  com_ui_attach_error_type: 'Tipo de arquivo não suportado para o endpoint:',
  com_ui_attach_error_openai: 'Não é possível anexar arquivos de Assistente a outros endpoints',
  com_ui_attach_warn_endpoint:
    'Arquivos não compatíveis podem ser ignorados sem uma ferramenta compatível',
  com_ui_attach_error_size: 'Limite de tamanho de arquivo excedido para o endpoint:',
  com_ui_attach_error:
    'Não é possível anexar o arquivo. Crie ou selecione uma conversa, ou tente atualizar a página.',
  com_ui_examples: 'Exemplos',
  com_ui_new_chat: 'Novo chat',
  com_ui_happy_birthday: 'É meu 1º aniversário!',
  com_ui_experimental: 'Recursos Experimentais',
  com_ui_on: 'Ligado',
  com_ui_off: 'Desligado',
  com_ui_yes: 'Sim',
  com_ui_no: 'Não',
  com_ui_ascending: 'Asc',
  com_ui_descending: 'Desc',
  com_ui_show_all: 'Mostrar Todos',
  com_ui_name: 'Nome',
  com_ui_date: 'Data',
  com_ui_storage: 'Armazenamento',
  com_ui_context: 'Contexto',
  com_ui_size: 'Tamanho',
  com_ui_host: 'Host',
  com_ui_update: 'Atualizar',
  com_ui_authentication: 'Autenticação',
  com_ui_instructions: 'Instruções',
  com_ui_description: 'Descrição',
  com_ui_error: 'Erro',
  com_ui_error_connection: 'Erro ao conectar ao servidor, tente atualizar a página.',
  com_ui_select: 'Selecionar',
  com_ui_input: 'Entrada',
  com_ui_close: 'Fechar',
  com_ui_endpoint: 'Endpoint',
  com_ui_provider: 'Provedor',
  com_ui_model: 'Modelo',
  com_ui_model_parameters: 'Parâmetros do Modelo',
  com_ui_model_save_success: 'Parâmetros do modelo salvos com sucesso',
  com_ui_select_model: 'Selecionar um modelo',
  com_ui_select_provider: 'Selecionar um provedor',
  com_ui_select_provider_first: 'Selecione um provedor primeiro',
  com_ui_select_search_model: 'Pesquisar modelo por nome',
  com_ui_select_search_plugin: 'Pesquisar plugin por nome',
  com_ui_use_prompt: 'Usar prompt',
  com_ui_prev: 'Anterior',
  com_ui_next: 'Próximo',
  com_ui_stop: 'Parar',
  com_ui_upload_files: 'Carregar arquivos',
  com_ui_prompt: 'Prompt',
  com_ui_prompts: 'Prompts',
  com_ui_prompt_name: 'Nome do Prompt',
  com_ui_delete_prompt: 'Excluir Prompt?',
  com_ui_admin: 'Admin',
  com_ui_simple: 'Simples',
  com_ui_versions: 'Versões',
  com_ui_version_var: 'Versão {0}',
  com_ui_advanced: 'Avançado',
  com_ui_admin_settings: 'Configurações de Admin',
  com_ui_error_save_admin_settings: 'Houve um erro ao salvar suas configurações de admin.',
  com_ui_prompt_preview_not_shared: 'O autor não permitiu colaboração para este prompt.',
  com_ui_prompt_name_required: 'Nome do Prompt é obrigatório',
  com_ui_prompt_text_required: 'Texto é obrigatório',
  com_ui_prompt_text: 'Texto',
  com_ui_back_to_chat: 'Voltar ao Chat',
  com_ui_back_to_prompts: 'Voltar aos Prompts',
  com_ui_categories: 'Categorias',
  com_ui_filter_prompts_name: 'Filtrar prompts por nome',
  com_ui_search_categories: 'Pesquisar Categorias',
  com_ui_manage: 'Gerenciar',
  com_ui_variables: 'Variáveis',
  com_ui_variables_info:
    'Use chaves duplas no seu texto para criar variáveis, por exemplo, `{{exemplo de variável}}`, para preencher posteriormente ao usar o prompt.',
  com_ui_special_variables: 'Variáveis especiais:',
  com_ui_special_variables_info:
    'Use `{{current_date}}` para a data atual, e `{{current_user}}` para o nome da sua conta.',
  com_ui_dropdown_variables: 'Variáveis de dropdown:',
  com_ui_dropdown_variables_info:
    'Crie menus dropdown personalizados para seus prompts: `{{nome_da_variável:opção1|opção2|opção3}}`',
  com_ui_showing: 'Mostrando',
  com_ui_of: 'de',
  com_ui_entries: 'Entradas',
  com_ui_pay_per_call: 'Todas as conversas de IA em um só lugar. Pague por chamada e não por mês',
  com_ui_new_footer: 'Todas as conversas de IA em um só lugar.',
  com_ui_latest_footer: 'Toda IA para Todos.',
  com_ui_enter: 'Entrar',
  com_ui_submit: 'Enviar',
  com_ui_none_selected: 'Nenhum selecionado',
  com_ui_upload_success: 'Arquivo carregado com sucesso',
  com_ui_upload_error: 'Houve um erro ao carregar seu arquivo',
  com_ui_upload_invalid: 'Arquivo inválido para upload. Deve ser uma imagem não excedendo o limite',
  com_ui_upload_invalid_var:
    'Arquivo inválido para upload. Deve ser uma imagem não excedendo {0} MB',
  com_ui_cancel: 'Cancelar',
  com_ui_save: 'Salvar',
  com_ui_renaming_var: 'Renomeando "{0}"',
  com_ui_save_submit: 'Salvar & Enviar',
  com_user_message: 'Você',
  com_ui_read_aloud: 'Ler em voz alta',
  com_ui_copied: 'Copiado!',
  com_ui_copy_code: 'Copiar código',
  com_ui_copy_to_clipboard: 'Copiar para a área de transferência',
  com_ui_copied_to_clipboard: 'Copiado para a área de transferência',
  com_ui_fork: 'Bifurcar',
  com_ui_fork_info_1: 'Use esta configuração para bifurcar mensagens com o comportamento desejado.',
  com_ui_fork_info_2:
    '"Bifurcação" refere-se à criação de uma nova conversa que começa/termina a partir de mensagens específicas na conversa atual, criando uma cópia de acordo com as opções selecionadas.',
  com_ui_fork_info_3:
    'A "mensagem alvo" refere-se à mensagem da qual este popup foi aberto, ou, se você marcar "{0}", a última mensagem na conversa.',
  com_ui_fork_info_visible:
    'Esta opção bifurca apenas as mensagens visíveis; em outras palavras, o caminho direto para a mensagem alvo, sem quaisquer ramificações.',
  com_ui_fork_info_branches:
    'Esta opção bifurca as mensagens visíveis, junto com ramificações relacionadas; em outras palavras, o caminho direto para a mensagem alvo, incluindo ramificações ao longo do caminho.',
  com_ui_fork_info_target:
    'Esta opção bifurca todas as mensagens até a mensagem alvo, incluindo seus vizinhos; em outras palavras, todos os ramos de mensagens, estejam ou não visíveis ou ao longo do mesmo caminho, estão incluídos.',
  com_ui_fork_info_start:
    'Se marcado, a bifurcação começará desta mensagem até a última mensagem na conversa, de acordo com o comportamento selecionado acima.',
  com_ui_fork_info_remember:
    'Marque isto para lembrar as opções que você seleciona para uso futuro, tornando mais rápido bifurcar conversas conforme preferido.',
  com_ui_fork_success: 'Conversa bifurcada com sucesso',
  com_ui_fork_processing: 'Bifurcando conversa...',
  com_ui_fork_error: 'Houve um erro ao bifurcar a conversa',
  com_ui_fork_change_default: 'Opção de bifurcação padrão',
  com_ui_fork_default: 'Usar opção de bifurcação padrão',
  com_ui_fork_remember: 'Lembrar',
  com_ui_fork_split_target_setting: 'Iniciar bifurcação a partir da mensagem alvo por padrão',
  com_ui_fork_split_target: 'Iniciar bifurcação aqui',
  com_ui_fork_remember_checked:
    'Sua seleção será lembrada após o uso. Altere isso a qualquer momento nas configurações.',
  com_ui_fork_all_target: 'Incluir todos para/de aqui',
  com_ui_fork_branches: 'Incluir ramificações relacionadas',
  com_ui_fork_visible: 'Apenas mensagens visíveis',
  com_ui_fork_from_message: 'Selecione uma opção de bifurcação',
  com_ui_mention:
    'Mencione um endpoint, assistente ou predefinição para alternar rapidamente para ele',
  com_ui_add_model_preset: 'Adicionar um modelo ou predefinição para uma resposta adicional',
  com_assistants_max_starters_reached: 'Número máximo de iniciadores de conversa atingido',
  com_ui_regenerate: 'Regenerar',
  com_ui_continue: 'Continuar',
  com_ui_edit: 'Editar',
  com_ui_loading: 'Carregando...',
  com_ui_success: 'Sucesso',
  com_ui_all: 'todos',
  com_ui_all_proper: 'Todos',
  com_ui_clear: 'Limpar',
  com_ui_revoke: 'Revogar',
  com_ui_revoke_info: 'Revogar todas as credenciais fornecidas pelo usuário',
  com_ui_import_conversation: 'Importar',
  com_ui_nothing_found: 'Nada encontrado',
  com_ui_go_to_conversation: 'Ir para a conversa',
  com_ui_import_conversation_info: 'Importar conversas de um arquivo JSON',
  com_ui_import_conversation_success: 'Conversas importadas com sucesso',
  com_ui_import_conversation_error: 'Houve um erro ao importar suas conversas',
  com_ui_import_conversation_file_type_error: 'Tipo de importação não suportado',
  com_ui_confirm_action: 'Confirmar Ação',
  com_ui_chat: 'Chat',
  com_ui_chat_history: 'Histórico de Chat',
  com_ui_controls: 'Controles',
  com_ui_dashboard: 'Painel',
  com_ui_chats: 'chats',
  com_ui_avatar: 'Avatar',
  com_ui_unknown: 'Desconhecido',
  com_ui_result: 'Resultado',
  com_ui_image_gen: 'Geração de Imagem',
  com_ui_assistant: 'Assistente',
  com_ui_assistant_deleted: 'Assistente excluído com sucesso',
  com_ui_assistant_delete_error: 'Houve um erro ao excluir o assistente',
  com_ui_assistants: 'Assistentes',
  com_ui_attachment: 'Anexo',
  com_ui_assistants_output: 'Saída dos Assistentes',
  com_ui_agent: 'Agente',
  com_ui_agent_deleted: 'Agente excluído com sucesso',
  com_ui_agent_delete_error: 'Houve um erro ao excluir o agente',
  com_ui_agents: 'Agentes',
  com_ui_delete_agent_confirm: 'Tem certeza de que deseja excluir este agente?',
  com_ui_delete: 'Excluir',
  com_ui_create: 'Criar',
  com_ui_create_prompt: 'Criar Prompt',
  com_ui_share: 'Compartilhar',
  com_ui_share_var: 'Compartilhar {0}',
  com_ui_enter_var: 'Inserir {0}',
  com_ui_copy_link: 'Copiar link',
  com_ui_create_link: 'Criar link',
  com_ui_share_to_all_users: 'Compartilhar com todos os usuários',
  com_ui_my_prompts: 'Meus Prompts',
  com_ui_no_category: 'Sem categoria',
  com_ui_shared_prompts: 'Prompts Compartilhados',
  com_ui_prompts_allow_use: 'Permitir uso de Prompts',
  com_ui_prompts_allow_create: 'Permitir criação de Prompts',
  com_ui_prompts_allow_share_global: 'Permitir compartilhamento de Prompts com todos os usuários',
  com_ui_prompt_shared_to_all: 'Este prompt é compartilhado com todos os usuários',
  com_ui_prompt_update_error: 'Houve um erro ao atualizar o prompt',
  com_ui_prompt_already_shared_to_all: 'Este prompt já está compartilhado com todos os usuários',
  com_ui_description_placeholder: 'Opcional: Insira uma descrição para exibir para o prompt',
  com_ui_command_placeholder: 'Opcional: Insira um comando para o prompt ou o nome será usado.',
  com_ui_command_usage_placeholder: 'Selecione um Prompt por comando ou nome',
  com_ui_no_prompt_description: 'Nenhuma descrição encontrada.',
  com_ui_share_link_to_chat: 'Compartilhar link para o chat',
  com_ui_share_error: 'Houve um erro ao compartilhar o link do chat',
  com_ui_share_retrieve_error: 'Houve um erro ao recuperar os links compartilhados',
  com_ui_share_delete_error: 'Houve um erro ao excluir o link compartilhado',
  com_ui_share_create_message:
    'Seu nome e quaisquer mensagens que você adicionar após o compartilhamento permanecerão privadas.',
  com_ui_share_created_message:
    'Um link compartilhado para o seu chat foi criado. Gerencie chats compartilhados anteriormente a qualquer momento via Configurações.',
  com_ui_share_update_message:
    'Seu nome, instruções personalizadas e quaisquer mensagens que você adicionar após o compartilhamento permanecerão privadas.',
  com_ui_share_updated_message:
    'Um link compartilhado para o seu chat foi atualizado. Gerencie chats compartilhados anteriormente a qualquer momento via Configurações.',
  com_ui_shared_link_not_found: 'Link compartilhado não encontrado',
  com_ui_delete_conversation: 'Excluir chat?',
  com_ui_delete_confirm: 'Isso excluirá',
  com_ui_delete_tool: 'Excluir Ferramenta',
  com_ui_delete_tool_confirm: 'Tem certeza de que deseja excluir esta ferramenta?',
  com_ui_delete_action: 'Excluir Ação',
  com_ui_delete_action_confirm: 'Tem certeza de que deseja excluir esta ação?',
  com_ui_delete_confirm_prompt_version_var:
    'Isso excluirá a versão selecionada para "{0}". Se não houver outras versões, o prompt será excluído.',
  com_ui_delete_assistant_confirm:
    'Tem certeza de que deseja excluir este Assistente? Isso não pode ser desfeito.',
  com_ui_rename: 'Renomear',
  com_ui_archive: 'Arquivar',
  com_ui_archive_error: 'Falha ao arquivar conversa',
  com_ui_unarchive: 'Desarquivar',
  com_ui_unarchive_error: 'Falha ao desarquivar conversa',
  com_ui_more_options: 'Mais',
  com_ui_preview: 'Pré-visualizar',
  com_ui_upload: 'Carregar',
  com_ui_connect: 'Conectar',
  com_ui_locked: 'Bloqueado',
  com_ui_upload_delay:
    'O upload de "{0}" está demorando mais do que o esperado. Por favor, aguarde enquanto o arquivo termina de ser indexado para recuperação.',
  com_ui_privacy_policy: 'Política de Privacidade',
  com_ui_terms_of_service: 'Termos de Serviço',
  com_ui_use_micrphone: 'Usar microfone',
  com_ui_min_tags: 'Não é possível remover mais valores, um mínimo de {0} é necessário.',
  com_ui_max_tags: 'O número máximo permitido é {0}, usando os valores mais recentes.',
  com_ui_bookmarks: 'Favoritos',
  com_ui_bookmarks_new: 'Novo Favorito',
  com_ui_bookmark_delete_confirm: 'Tem certeza de que deseja excluir este favorito?',
  com_ui_bookmarks_title: 'Título',
  com_ui_bookmarks_count: 'Contagem',
  com_ui_bookmarks_description: 'Descrição',
  com_ui_bookmarks_create_success: 'Favorito criado com sucesso',
  com_ui_bookmarks_update_success: 'Favorito atualizado com sucesso',
  com_ui_bookmarks_delete_success: 'Favorito excluído com sucesso',
  com_ui_bookmarks_create_exists: 'Este favorito já existe',
  com_ui_bookmarks_create_error: 'Houve um erro ao criar o favorito',
  com_ui_bookmarks_update_error: 'Houve um erro ao atualizar o favorito',
  com_ui_bookmarks_delete_error: 'Houve um erro ao excluir o favorito',
  com_ui_bookmarks_add_to_conversation: 'Adicionar à conversa atual',
  com_ui_bookmarks_filter: 'Filtrar favoritos...',
  com_ui_no_bookmarks:
    'Parece que você ainda não tem favoritos. Clique em um chat e adicione um novo',
  com_ui_no_conversation_id: 'Nenhum ID de conversa encontrado',
  com_auth_error_login:
    'Não foi possível fazer login com as informações fornecidas. Por favor, verifique suas credenciais e tente novamente.',
  com_auth_error_login_rl:
    'Muitas tentativas de login em um curto período de tempo. Por favor, tente novamente mais tarde.',
  com_auth_error_login_ban:
    'Sua conta foi temporariamente banida devido a violações do nosso serviço.',
  com_auth_error_login_server:
    'Houve um erro interno no servidor. Por favor, aguarde alguns momentos e tente novamente.',
  com_auth_error_login_unverified:
    'Sua conta não foi verificada. Por favor, verifique seu e-mail para um link de verificação.',
  com_auth_no_account: 'Não tem uma conta?',
  com_auth_sign_up: 'Inscrever-se',
  com_auth_sign_in: 'Entrar',
  com_auth_google_login: 'Continuar com Google',
  com_auth_facebook_login: 'Continuar com Facebook',
  com_auth_github_login: 'Continuar com Github',
  com_auth_discord_login: 'Continuar com Discord',
  com_auth_email: 'E-mail',
  com_auth_email_required: 'E-mail é obrigatório',
  com_auth_email_min_length: 'O e-mail deve ter pelo menos 6 caracteres',
  com_auth_email_max_length: 'O e-mail não deve ter mais de 120 caracteres',
  com_auth_email_pattern: 'Você deve inserir um endereço de e-mail válido',
  com_auth_email_address: 'Endereço de e-mail',
  com_auth_password: 'Senha',
  com_auth_password_required: 'Senha é obrigatória',
  com_auth_password_min_length: 'A senha deve ter pelo menos 8 caracteres',
  com_auth_password_max_length: 'A senha deve ter menos de 128 caracteres',
  com_auth_password_forgot: 'Esqueceu a senha?',
  com_auth_password_confirm: 'Confirmar senha',
  com_auth_password_not_match: 'As senhas não coincidem',
  com_auth_continue: 'Continuar',
  com_auth_create_account: 'Criar sua conta',
  com_auth_error_create: 'Houve um erro ao tentar registrar sua conta. Por favor, tente novamente.',
  com_auth_full_name: 'Nome completo',
  com_auth_name_required: 'Nome é obrigatório',
  com_auth_name_min_length: 'O nome deve ter pelo menos 3 caracteres',
  com_auth_name_max_length: 'O nome deve ter menos de 80 caracteres',
  com_auth_username: 'Nome de usuário (opcional)',
  com_auth_username_required: 'Nome de usuário é obrigatório',
  com_auth_username_min_length: 'O nome de usuário deve ter pelo menos 2 caracteres',
  com_auth_username_max_length: 'O nome de usuário deve ter menos de 20 caracteres',
  com_auth_already_have_account: 'Já tem uma conta?',
  com_auth_login: 'Entrar',
  com_auth_registration_success_insecure: 'Registro bem-sucedido.',
  com_auth_registration_success_generic:
    'Por favor, verifique seu e-mail para verificar seu endereço de e-mail.',
  com_auth_reset_password: 'Redefinir sua senha',
  com_auth_click: 'Clique',
  com_auth_here: 'AQUI',
  com_auth_to_reset_your_password: 'para redefinir sua senha.',
  com_auth_reset_password_link_sent: 'E-mail enviado',
  com_auth_reset_password_if_email_exists:
    'Se uma conta com esse e-mail existir, um e-mail com instruções para redefinir a senha foi enviado. Certifique-se de verificar sua pasta de spam.',
  com_auth_reset_password_email_sent:
    'Se o usuário estiver registrado, um e-mail será enviado para a caixa de entrada.',
  com_auth_reset_password_success: 'Senha redefinida com sucesso',
  com_auth_login_with_new_password: 'Agora você pode fazer login com sua nova senha.',
  com_auth_error_invalid_reset_token: 'Este token de redefinição de senha não é mais válido.',
  com_auth_click_here: 'Clique aqui',
  com_auth_to_try_again: 'para tentar novamente.',
  com_auth_submit_registration: 'Enviar registro',
  com_auth_welcome_back: 'Bem-vindo de volta',
  com_auth_back_to_login: 'Voltar para Login',
  com_auth_email_verification_failed: 'Falha na verificação de e-mail',
  com_auth_email_verification_rate_limited:
    'Muitas solicitações. Por favor, tente novamente mais tarde',
  com_auth_email_verification_success: 'E-mail verificado com sucesso',
  com_auth_email_resent_success: 'E-mail de verificação reenviado com sucesso',
  com_auth_email_resent_failed: 'Falha ao reenviar e-mail de verificação',
  com_auth_email_verification_failed_token_missing: 'Falha na verificação, token ausente',
  com_auth_email_verification_invalid: 'Verificação de e-mail inválida',
  com_auth_email_verification_in_progress: 'Verificando seu e-mail, por favor, aguarde',
  com_auth_email_verification_resend_prompt: 'Não recebeu o e-mail?',
  com_auth_email_resend_link: 'Reenviar E-mail',
  com_auth_email_verification_redirecting: 'Redirecionando em {0} segundos...',
  com_endpoint_open_menu: 'Abrir Menu',
  com_endpoint_bing_enable_sydney: 'Habilitar Sydney',
  com_endpoint_bing_to_enable_sydney: 'Para habilitar Sydney',
  com_endpoint_bing_jailbreak: 'Jailbreak',
  com_endpoint_bing_context_placeholder:
    'O Bing pode usar até 7k tokens para "contexto", que pode referenciar para a conversa. O limite específico não é conhecido, mas pode ocorrer erros ao exceder 7k tokens',
  com_endpoint_bing_system_message_placeholder:
    'AVISO: O uso indevido deste recurso pode resultar em BANIMENTO do uso do Bing! Clique em "Mensagem do Sistema" para instruções completas e a mensagem padrão se omitida, que é o preset "Sydney" considerado seguro.',
  com_endpoint_system_message: 'Mensagem do Sistema',
  com_endpoint_message: 'Mensagem',
  com_endpoint_message_not_appendable: 'Edite sua mensagem ou Regenerar.',
  com_endpoint_default_blank: 'padrão: em branco',
  com_endpoint_default_false: 'padrão: falso',
  com_endpoint_default_creative: 'padrão: criativo',
  com_endpoint_default_empty: 'padrão: vazio',
  com_endpoint_default_with_num: 'padrão: {0}',
  com_endpoint_context: 'Contexto',
  com_endpoint_tone_style: 'Estilo de Tom',
  com_endpoint_token_count: 'Contagem de Tokens',
  com_endpoint_output: 'Saída',
  com_endpoint_context_tokens: 'Máximo de Tokens de Contexto',
  com_endpoint_context_info:
    'O número máximo de tokens que podem ser usados para contexto. Use isso para controlar quantos tokens são enviados por solicitação. Se não especificado, usará os padrões do sistema com base no tamanho do contexto dos modelos conhecidos. Definir valores mais altos pode resultar em erros e/ou maior custo de tokens.',
  com_endpoint_google_temp:
    'Valores mais altos = mais aleatório, enquanto valores mais baixos = mais focado e determinístico. Recomendamos alterar isso ou Top P, mas não ambos.',
  com_endpoint_google_topp:
    'Top-p altera como o modelo seleciona tokens para saída. Os tokens são selecionados dos mais prováveis (veja o parâmetro topK) até os menos prováveis até que a soma de suas probabilidades atinja o valor top-p.',
  com_endpoint_google_topk:
    'Top-k altera como o modelo seleciona tokens para saída. Um top-k de 1 significa que o token selecionado é o mais provável entre todos os tokens no vocabulário do modelo (também chamado de decodificação gananciosa), enquanto um top-k de 3 significa que o próximo token é selecionado entre os 3 tokens mais prováveis (usando temperatura).',
  com_endpoint_google_maxoutputtokens:
    'Número máximo de tokens que podem ser gerados na resposta. Especifique um valor mais baixo para respostas mais curtas e um valor mais alto para respostas mais longas. Nota: os modelos podem parar antes de atingir esse máximo.',
  com_endpoint_google_custom_name_placeholder: 'Defina um nome personalizado para o Google',
  com_endpoint_prompt_prefix_placeholder:
    'Defina instruções ou contexto personalizados. Ignorado se vazio.',
  com_endpoint_instructions_assistants_placeholder:
    'Substitui as instruções do assistente. Isso é útil para modificar o comportamento em uma base por execução.',
  com_endpoint_prompt_prefix_assistants_placeholder:
    'Defina instruções ou contexto adicionais além das instruções principais do Assistente. Ignorado se vazio.',
  com_endpoint_custom_name: 'Nome Personalizado',
  com_endpoint_prompt_prefix: 'Instruções Personalizadas',
  com_endpoint_prompt_prefix_assistants: 'Instruções Adicionais',
  com_endpoint_instructions_assistants: 'Substituir Instruções',
  com_endpoint_temperature: 'Temperatura',
  com_endpoint_default: 'padrão',
  com_endpoint_top_p: 'Top P',
  com_endpoint_top_k: 'Top K',
  com_endpoint_max_output_tokens: 'Máximo de Tokens de Saída',
  com_endpoint_stop: 'Sequências de Parada',
  com_endpoint_stop_placeholder: 'Separe os valores pressionando `Enter`',
  com_endpoint_openai_max_tokens:
    'Campo opcional `max_tokens`, representando o número máximo de tokens que podem ser gerados na conclusão do chat. O comprimento total dos tokens de entrada e dos tokens gerados é limitado pelo comprimento do contexto dos modelos. Você pode experimentar erros se esse número exceder o máximo de tokens de contexto.',
  com_endpoint_openai_temp:
    'Valores mais altos = mais aleatório, enquanto valores mais baixos = mais focado e determinístico. Recomendamos alterar isso ou Top P, mas não ambos.',
  com_endpoint_openai_max:
    'O máximo de tokens para gerar. O comprimento total dos tokens de entrada e dos tokens gerados é limitado pelo comprimento do contexto do modelo.',
  com_endpoint_openai_topp:
    'Uma alternativa à amostragem com temperatura, chamada amostragem de núcleo, onde o modelo considera os resultados dos tokens com massa de probabilidade top_p. Então, 0.1 significa que apenas os tokens que compreendem os 10% principais da massa de probabilidade são considerados. Recomendamos alterar isso ou a temperatura, mas não ambos.',
  com_endpoint_openai_freq:
    'Número entre -2.0 e 2.0. Valores positivos penalizam novos tokens com base em sua frequência existente no texto até agora, diminuindo a probabilidade do modelo de repetir a mesma linha literalmente.',
  com_endpoint_openai_pres:
    'Número entre -2.0 e 2.0. Valores positivos penalizam novos tokens com base em sua presença no texto até agora, aumentando a probabilidade do modelo de falar sobre novos tópicos.',
  com_endpoint_openai_resend:
    'Reenviar todas as imagens anexadas anteriormente. Nota: isso pode aumentar significativamente o custo de tokens e você pode experimentar erros com muitos anexos de imagem.',
  com_endpoint_openai_resend_files:
    'Reenviar todos os arquivos anexados anteriormente. Nota: isso aumentará o custo de tokens e você pode experimentar erros com muitos anexos.',
  com_endpoint_openai_detail:
    'A resolução para solicitações de Visão. "Baixa" é mais barata e rápida, "Alta" é mais detalhada e cara, e "Auto" escolherá automaticamente entre as duas com base na resolução da imagem.',
  com_endpoint_openai_stop: 'Até 4 sequências onde a API parará de gerar mais tokens.',
  com_endpoint_openai_custom_name_placeholder: 'Defina um nome personalizado para a IA',
  com_endpoint_openai_prompt_prefix_placeholder:
    'Defina instruções personalizadas para incluir na Mensagem do Sistema. Padrão: nenhuma',
  com_endpoint_anthropic_temp:
    'Varia de 0 a 1. Use temperatura mais próxima de 0 para tarefas analíticas / de múltipla escolha, e mais próxima de 1 para tarefas criativas e generativas. Recomendamos alterar isso ou Top P, mas não ambos.',
  com_endpoint_anthropic_topp:
    'Top-p altera como o modelo seleciona tokens para saída. Os tokens são selecionados dos mais prováveis (veja o parâmetro topK) até os menos prováveis até que a soma de suas probabilidades atinja o valor top-p.',
  com_endpoint_anthropic_topk:
    'Top-k altera como o modelo seleciona tokens para saída. Um top-k de 1 significa que o token selecionado é o mais provável entre todos os tokens no vocabulário do modelo (também chamado de decodificação gananciosa), enquanto um top-k de 3 significa que o próximo token é selecionado entre os 3 tokens mais prováveis (usando temperatura).',
  com_endpoint_anthropic_maxoutputtokens:
    'Número máximo de tokens que podem ser gerados na resposta. Especifique um valor mais baixo para respostas mais curtas e um valor mais alto para respostas mais longas. Nota: os modelos podem parar antes de atingir esse máximo.',
  com_endpoint_anthropic_prompt_cache:
    'O cache de prompt permite reutilizar um grande contexto ou instruções em chamadas de API, reduzindo custos e latência',
  com_endpoint_prompt_cache: 'Usar Cache de Prompt',
  com_endpoint_anthropic_custom_name_placeholder: 'Defina um nome personalizado para Anthropic',
  com_endpoint_frequency_penalty: 'Penalidade de Frequência',
  com_endpoint_presence_penalty: 'Penalidade de Presença',
  com_endpoint_plug_use_functions: 'Usar Funções',
  com_endpoint_plug_resend_files: 'Reenviar Arquivos',
  com_endpoint_plug_resend_images: 'Reenviar Imagens',
  com_endpoint_plug_image_detail: 'Detalhe da Imagem',
  com_endpoint_plug_skip_completion: 'Pular Conclusão',
  com_endpoint_disabled_with_tools: 'desativado com ferramentas',
  com_endpoint_disabled_with_tools_placeholder: 'Desativado com Ferramentas Selecionadas',
  com_endpoint_plug_set_custom_instructions_for_gpt_placeholder:
    'Defina instruções personalizadas para incluir na Mensagem do Sistema. Padrão: nenhuma',
  com_endpoint_import: 'Importar',
  com_endpoint_set_custom_name:
    'Defina um nome personalizado, caso você possa encontrar este preset',
  com_endpoint_preset_delete_confirm: 'Tem certeza de que deseja excluir este preset?',
  com_endpoint_preset_clear_all_confirm: 'Tem certeza de que deseja excluir todos os seus presets?',
  com_endpoint_preset_import: 'Preset Importado!',
  com_endpoint_preset_import_error:
    'Houve um erro ao importar seu preset. Por favor, tente novamente.',
  com_endpoint_preset_save_error: 'Houve um erro ao salvar seu preset. Por favor, tente novamente.',
  com_endpoint_preset_delete_error:
    'Houve um erro ao excluir seu preset. Por favor, tente novamente.',
  com_endpoint_preset_default_removed: 'não é mais o preset padrão.',
  com_endpoint_preset_default_item: 'Padrão:',
  com_endpoint_preset_default_none: 'Nenhum preset padrão ativo.',
  com_endpoint_preset_title: 'Preset',
  com_ui_saved: 'Salvo!',
  com_endpoint_preset_default: 'é agora o preset padrão.',
  com_endpoint_preset: 'preset',
  com_endpoint_presets: 'presets',
  com_endpoint_preset_selected: 'Preset Ativo!',
  com_endpoint_preset_selected_title: 'Ativo!',
  com_endpoint_preset_name: 'Nome do Preset',
  com_endpoint_new_topic: 'Novo Tópico',
  com_endpoint: 'Endpoint',
  com_endpoint_hide: 'Ocultar',
  com_endpoint_show: 'Mostrar',
  com_endpoint_examples: 'Presets',
  com_endpoint_completion: 'Conclusão',
  com_endpoint_agent: 'Agente',
  com_endpoint_show_what_settings: 'Mostrar Configurações de {0}',
  com_endpoint_export: 'Exportar',
  com_endpoint_export_share: 'Exportar/Compartilhar',
  com_endpoint_assistant: 'Assistente',
  com_endpoint_use_active_assistant: 'Usar Assistente Ativo',
  com_endpoint_assistant_model: 'Modelo de Assistente',
  com_endpoint_save_as_preset: 'Salvar Como Preset',
  com_endpoint_presets_clear_warning:
    'Tem certeza de que deseja limpar todos os presets? Isso é irreversível.',
  com_endpoint_not_implemented: 'Não implementado',
  com_endpoint_no_presets: 'Ainda não há presets, use o botão de configurações para criar um',
  com_endpoint_not_available: 'Nenhum endpoint disponível',
  com_endpoint_view_options: 'Ver Opções',
  com_endpoint_save_convo_as_preset: 'Salvar Conversa como Preset',
  com_endpoint_my_preset: 'Meu Preset',
  com_endpoint_agent_model: 'Modelo de Agente (Recomendado: GPT-3.5)',
  com_endpoint_completion_model: 'Modelo de Conclusão (Recomendado: GPT-4)',
  com_endpoint_func_hover: 'Habilitar uso de Plugins como Funções OpenAI',
  com_endpoint_skip_hover:
    'Habilitar pular a etapa de conclusão, que revisa a resposta final e os passos gerados',
  com_endpoint_config_key: 'Definir Chave API',
  com_endpoint_assistant_placeholder:
    'Por favor, selecione um Assistente no Painel Lateral Direito',
  com_endpoint_config_placeholder: 'Defina sua Chave no menu do Cabeçalho para conversar.',
  com_endpoint_config_key_for: 'Definir Chave API para',
  com_endpoint_config_key_name: 'Chave',
  com_endpoint_config_value: 'Insira o valor para',
  com_endpoint_config_key_name_placeholder: 'Defina a chave API primeiro',
  com_endpoint_config_key_encryption: 'Sua chave será criptografada e excluída em',
  com_endpoint_config_key_never_expires: 'Sua chave nunca expira',
  com_endpoint_config_key_expiry: 'o tempo de expiração',
  com_endpoint_config_click_here: 'Clique Aqui',
  com_endpoint_config_google_service_key: 'Chave de Conta de Serviço do Google',
  com_endpoint_config_google_cloud_platform: '(do Google Cloud Platform)',
  com_endpoint_config_google_api_key: 'Chave API do Google',
  com_endpoint_config_google_gemini_api: '(API Gemini)',
  com_endpoint_config_google_api_info:
    'Para obter sua chave API de Linguagem Generativa (para Gemini),',
  com_endpoint_config_key_import_json_key: 'Importar Chave JSON da Conta de Serviço.',
  com_endpoint_config_key_import_json_key_success:
    'Chave JSON da Conta de Serviço Importada com Sucesso',
  com_endpoint_config_key_import_json_key_invalid:
    'Chave JSON da Conta de Serviço Inválida, Você importou o arquivo correto?',
  com_endpoint_config_key_get_edge_key: 'Para obter seu token de acesso para o Bing, faça login em',
  com_endpoint_config_key_get_edge_key_dev_tool:
    'Use ferramentas de desenvolvedor ou uma extensão enquanto estiver logado no site para copiar o conteúdo do cookie _U. Se isso falhar, siga estas',
  com_endpoint_config_key_edge_instructions: 'instruções',
  com_endpoint_config_key_edge_full_key_string: 'para fornecer as strings completas do cookie.',
  com_endpoint_config_key_chatgpt:
    'Para obter seu token de acesso para o ChatGPT "Versão Gratuita", faça login em',
  com_endpoint_config_key_chatgpt_then_visit: 'depois visite',
  com_endpoint_config_key_chatgpt_copy_token: 'Copiar token de acesso.',
  com_endpoint_config_key_google_need_to: 'Você precisa',
  com_endpoint_config_key_google_vertex_ai: 'Habilitar Vertex AI',
  com_endpoint_config_key_google_vertex_api: 'API no Google Cloud, então',
  com_endpoint_config_key_google_service_account: 'Criar uma Conta de Serviço',
  com_endpoint_config_key_google_vertex_api_role:
    'Certifique-se de clicar em "Criar e Continuar" para dar pelo menos o papel de "Usuário do Vertex AI". Por fim, crie uma chave JSON para importar aqui.',
  com_nav_account_settings: 'Configurações da Conta',
  com_nav_font_size: 'Tamanho da Fonte da Mensagem',
  com_nav_font_size_xs: 'Extra Pequeno',
  com_nav_font_size_sm: 'Pequeno',
  com_nav_font_size_base: 'Médio',
  com_nav_font_size_lg: 'Grande',
  com_nav_font_size_xl: 'Extra Grande',
  com_nav_welcome_assistant: 'Por favor, Selecione um Assistente',
  com_nav_welcome_message: 'Como posso ajudar você hoje?',
  com_nav_auto_scroll: 'Rolagem Automática para a última mensagem ao abrir o chat',
  com_nav_hide_panel: 'Ocultar painel mais à direita',
  com_nav_modular_chat: 'Habilitar troca de Endpoints no meio da conversa',
  com_nav_latex_parsing: 'Análise de LaTeX em mensagens (pode afetar o desempenho)',
  com_nav_text_to_speech: 'Texto para Fala',
  com_nav_automatic_playback: 'Reprodução Automática da Última Mensagem',
  com_nav_speech_to_text: 'Fala para Texto',
  com_nav_profile_picture: 'Foto de Perfil',
  com_nav_change_picture: 'Mudar foto',
  com_nav_plugin_store: 'Loja de Plugins',
  com_nav_plugin_install: 'Instalar',
  com_nav_plugin_uninstall: 'Desinstalar',
  com_ui_add: 'Adicionar',
  com_nav_tool_remove: 'Remover',
  com_nav_tool_dialog: 'Ferramentas do Assistente',
  com_ui_misc: 'Diversos',
  com_ui_roleplay: 'Roleplay',
  com_ui_write: 'Escrita',
  com_ui_idea: 'Ideias',
  com_ui_shop: 'Compras',
  com_ui_finance: 'Finanças',
  com_ui_code: 'Código',
  com_ui_travel: 'Viagem',
  com_ui_teach_or_explain: 'Aprendizado',
  com_ui_select_file: 'Selecionar um arquivo',
  com_ui_drag_drop_file: 'Arraste e solte um arquivo aqui',
  com_ui_upload_image: 'Carregar uma imagem',
  com_ui_select_a_category: 'Nenhuma categoria selecionada',
  com_ui_clear_all: 'Limpar tudo',
  com_nav_tool_dialog_description:
    'O assistente deve ser salvo para persistir as seleções de ferramentas.',
  com_show_agent_settings: 'Mostrar Configurações do Agente',
  com_show_completion_settings: 'Mostrar Configurações de Conclusão',
  com_hide_examples: 'Ocultar Exemplos',
  com_show_examples: 'Mostrar Exemplos',
  com_nav_plugin_search: 'Buscar plugins',
  com_nav_tool_search: 'Buscar ferramentas',
  com_nav_plugin_auth_error:
    'Houve um erro ao tentar autenticar este plugin. Por favor, tente novamente.',
  com_nav_export_filename: 'Nome do arquivo',
  com_nav_export_filename_placeholder: 'Definir o nome do arquivo',
  com_nav_export_type: 'Tipo',
  com_nav_export_include_endpoint_options: 'Incluir opções de endpoint',
  com_nav_enabled: 'Habilitado',
  com_nav_not_supported: 'Não Suportado',
  com_nav_export_all_message_branches: 'Exportar todos os ramos de mensagens',
  com_nav_export_recursive_or_sequential: 'Recursivo ou sequencial?',
  com_nav_export_recursive: 'Recursivo',
  com_nav_export_conversation: 'Exportar conversa',
  com_nav_export: 'Exportar',
  com_nav_shared_links: 'Links compartilhados',
  com_nav_shared_links_manage: 'Gerenciar',
  com_nav_shared_links_empty: 'Você não tem links compartilhados.',
  com_nav_shared_links_name: 'Nome',
  com_nav_shared_links_date_shared: 'Data de compartilhamento',
  com_nav_source_chat: 'Ver chat de origem',
  com_nav_my_files: 'Meus Arquivos',
  com_nav_theme: 'Tema',
  com_nav_theme_system: 'Sistema',
  com_nav_theme_dark: 'Escuro',
  com_nav_theme_light: 'Claro',
  com_nav_enter_to_send: 'Pressione Enter para enviar mensagens',
  com_nav_user_name_display: 'Exibir nome de usuário nas mensagens',
  com_nav_save_drafts: 'Salvar rascunhos localmente',
  com_nav_chat_direction: 'Direção do chat',
  com_nav_show_code: 'Sempre mostrar código ao usar o interpretador de código',
  com_nav_auto_send_prompts: 'Enviar prompts automaticamente',
  com_nav_always_make_prod: 'Sempre tornar novas versões produção',
  com_nav_clear_all_chats: 'Limpar todos os chats',
  com_nav_confirm_clear: 'Confirmar Limpeza',
  com_nav_close_sidebar: 'Fechar barra lateral',
  com_nav_open_sidebar: 'Abrir barra lateral',
  com_nav_send_message: 'Enviar mensagem',
  com_nav_log_out: 'Sair',
  com_nav_user: 'USUÁRIO',
  com_nav_archived_chats: 'Chats Arquivados',
  com_nav_archived_chats_manage: 'Gerenciar',
  com_nav_archived_chats_empty: 'Você não tem conversas arquivadas.',
  com_nav_archive_all_chats: 'Arquivar todos os chats',
  com_nav_archive_all: 'Arquivar tudo',
  com_nav_archive_name: 'Nome',
  com_nav_archive_created_at: 'Data de Arquivamento',
  com_nav_clear_conversation: 'Limpar conversas',
  com_nav_clear_conversation_confirm_message:
    'Tem certeza de que deseja limpar todas as conversas? Isso é irreversível.',
  com_nav_help_faq: 'Ajuda & FAQ',
  com_nav_settings: 'Configurações',
  com_nav_search_placeholder: 'Buscar mensagens',
  com_nav_delete_account: 'Excluir conta',
  com_nav_delete_account_confirm: 'Excluir conta - você tem certeza?',
  com_nav_delete_account_button: 'Excluir minha conta permanentemente',
  com_nav_delete_account_email_placeholder: 'Por favor, insira o e-mail da sua conta',
  com_nav_delete_account_confirm_placeholder: 'Para prosseguir, digite "EXCLUIR" no campo abaixo',
  com_nav_delete_warning: 'AVISO: Isso excluirá permanentemente sua conta.',
  com_nav_delete_data_info: 'Todos os seus dados serão excluídos.',
  com_nav_conversation_mode: 'Modo de Conversa',
  com_nav_auto_send_text: 'Enviar texto automaticamente',
  com_nav_auto_send_text_disabled: 'definir -1 para desativar',
  com_nav_auto_transcribe_audio: 'Transcrever áudio automaticamente',
  com_nav_db_sensitivity: 'Sensibilidade de decibéis',
  com_nav_playback_rate: 'Taxa de Reprodução de Áudio',
  com_nav_audio_play_error: 'Erro ao reproduzir áudio: {0}',
  com_nav_audio_process_error: 'Erro ao processar áudio: {0}',
  com_nav_long_audio_warning: 'Textos mais longos levarão mais tempo para processar.',
  com_nav_tts_init_error: 'Falha ao inicializar texto-para-fala: {0}',
  com_nav_tts_unsupported_error:
    'Texto-para-fala para o mecanismo selecionado não é suportado neste navegador.',
  com_nav_source_buffer_error:
    'Erro ao configurar a reprodução de áudio. Por favor, atualize a página.',
  com_nav_media_source_init_error:
    'Não foi possível preparar o reprodutor de áudio. Por favor, verifique as configurações do seu navegador.',
  com_nav_buffer_append_error:
    'Problema com o streaming de áudio. A reprodução pode ser interrompida.',
  com_nav_speech_cancel_error:
    'Não foi possível parar a reprodução de áudio. Você pode precisar atualizar a página.',
  com_nav_voices_fetch_error:
    'Não foi possível recuperar as opções de voz. Por favor, verifique sua conexão com a internet.',
  com_nav_engine: 'Motor',
  com_nav_browser: 'Navegador',
  com_nav_edge: 'Edge',
  com_nav_external: 'Externo',
  com_nav_delete_cache_storage: 'Excluir armazenamento de cache TTS',
  com_nav_enable_cache_tts: 'Habilitar cache TTS',
  com_nav_voice_select: 'Voz',
  com_nav_enable_cloud_browser_voice: 'Usar vozes baseadas na nuvem',
  com_nav_info_enter_to_send:
    'Quando habilitado, pressionar `ENTER` enviará sua mensagem. Quando desabilitado, pressionar Enter adicionará uma nova linha, e você precisará pressionar `CTRL + ENTER` / `⌘ + ENTER` para enviar sua mensagem.',
  com_nav_info_save_draft:
    'Quando habilitado, o texto e os anexos que você inserir no formulário de chat serão salvos automaticamente localmente como rascunhos. Esses rascunhos estarão disponíveis mesmo se você recarregar a página ou mudar para uma conversa diferente. Os rascunhos são armazenados localmente no seu dispositivo e são excluídos uma vez que a mensagem é enviada.',
  com_nav_info_fork_change_default:
    '`Apenas mensagens visíveis` inclui apenas o caminho direto para a mensagem selecionada. `Incluir ramos relacionados` adiciona ramos ao longo do caminho. `Incluir tudo de/para aqui` inclui todas as mensagens e ramos conectados.',
  com_nav_info_fork_split_target_setting:
    'Quando habilitado, a bifurcação começará da mensagem alvo até a última mensagem na conversa, de acordo com o comportamento selecionado.',
  com_nav_info_user_name_display:
    'Quando habilitado, o nome de usuário do remetente será mostrado acima de cada mensagem que você enviar. Quando desabilitado, você verá apenas "Você" acima de suas mensagens.',
  com_nav_info_latex_parsing:
    'Quando habilitado, o código LaTeX nas mensagens será renderizado como equações matemáticas. Desabilitar isso pode melhorar o desempenho se você não precisar de renderização LaTeX.',
  com_nav_info_revoke:
    'Esta ação revogará e removerá todas as chaves de API que você forneceu. Você precisará reentrar essas credenciais para continuar usando esses endpoints.',
  com_nav_info_delete_cache_storage:
    'Esta ação excluirá todos os arquivos de áudio TTS (Texto-para-Fala) armazenados em cache no seu dispositivo. Arquivos de áudio em cache são usados para acelerar a reprodução de TTS gerado anteriormente, mas podem consumir espaço de armazenamento no seu dispositivo.',
  com_nav_commands: 'Comandos',
  com_nav_commands_tab: 'Configurações de Comando',
  com_nav_at_command: 'Comando @',
  com_nav_at_command_description:
    'Alternar comando "@" para alternar endpoints, modelos, predefinições, etc.',
  com_nav_plus_command: 'Comando +',
  com_nav_plus_command_description:
    'Alternar comando "+" para adicionar uma configuração de resposta múltipla',
  com_nav_slash_command: 'Comando /',
  com_nav_slash_command_description: 'Alternar comando "/" para selecionar um prompt via teclado',
  com_nav_command_settings: 'Configurações de Comando',
  com_nav_command_settings_description: 'Personalizar quais comandos estão disponíveis no chat',
  com_nav_setting_general: 'Geral',
  com_nav_setting_chat: 'Chat',
  com_nav_setting_beta: 'Recursos beta',
  com_nav_setting_data: 'Controles de dados',
  com_nav_setting_account: 'Conta',
  com_nav_setting_speech: 'Fala',
  com_nav_language: 'Idioma',
  com_nav_lang_auto: 'Detecção automática',
  com_nav_lang_english: 'English',
  com_nav_lang_chinese: '中文',
  com_nav_lang_german: 'Deutsch',
  com_nav_lang_spanish: 'Español',
  com_nav_lang_french: 'Français ',
  com_nav_lang_italian: 'Italiano',
  com_nav_lang_polish: 'Polski',
  com_nav_lang_brazilian_portuguese: 'Português Brasileiro',
  com_nav_lang_russian: 'Русский',
  com_nav_lang_japanese: '日本語',
  com_nav_lang_swedish: 'Svenska',
  com_nav_lang_korean: '한국어',
  com_nav_lang_vietnamese: 'Tiếng Việt',
  com_nav_lang_traditionalchinese: '繁體中文',
  com_nav_lang_arabic: 'العربية',
  com_nav_lang_turkish: 'Türkçe',
  com_nav_lang_dutch: 'Nederlands',
  com_nav_lang_indonesia: 'Indonesia',
  com_nav_lang_hebrew: 'עברית',
  com_nav_lang_finnish: 'Suomi',
  com_ui_accept: 'Eu aceito',
  com_ui_decline: 'Eu não aceito',
  com_ui_terms_and_conditions: 'Termos e Condições',
  com_ui_no_terms_content: 'Nenhum conteúdo de termos e condições para exibir',
};

export const comparisons = {
  com_files_no_results: {
    english: 'No results.',
    translated: 'Nenhum resultado.',
  },
  com_files_filter: {
    english: 'Filter files...',
    translated: 'Filtrar arquivos...',
  },
  com_files_number_selected: {
    english: '{0} of {1} file(s) selected',
    translated: '{0} de {1} arquivo(s) selecionado(s)',
  },
  com_sidepanel_select_assistant: {
    english: 'Select an Assistant',
    translated: 'Selecionar um Assistente',
  },
  com_sidepanel_assistant_builder: {
    english: 'Assistant Builder',
    translated: 'Construtor de Assistente',
  },
  com_sidepanel_hide_panel: {
    english: 'Hide Panel',
    translated: 'Ocultar Painel',
  },
  com_sidepanel_attach_files: {
    english: 'Attach Files',
    translated: 'Anexar Arquivos',
  },
  com_sidepanel_manage_files: {
    english: 'Manage Files',
    translated: 'Gerenciar Arquivos',
  },
  com_sidepanel_conversation_tags: {
    english: 'Bookmarks',
    translated: 'Favoritos',
  },
  com_assistants_capabilities: {
    english: 'Capabilities',
    translated: 'Capacidades',
  },
  com_assistants_knowledge: {
    english: 'Knowledge',
    translated: 'Conhecimento',
  },
  com_assistants_knowledge_info: {
    english:
      'If you upload files under Knowledge, conversations with your Assistant may include file contents.',
    translated:
      'Se você enviar arquivos de Conhecimento, as conversas com seu Assistente podem incluir o conteúdo dos arquivos.',
  },
  com_assistants_knowledge_disabled: {
    english:
      'Assistant must be created, and Code Interpreter or Retrieval must be enabled and saved before uploading files as Knowledge.',
    translated:
      'O Assistente deve ser criado, e o Interpretador de Código ou Recuperação devem ser habilitados e salvos antes de enviar arquivos como Conhecimento.',
  },
  com_assistants_image_vision: {
    english: 'Image Vision',
    translated: 'Visão de Imagem',
  },
  com_assistants_code_interpreter: {
    english: 'Code Interpreter',
    translated: 'Interpretador de Código',
  },
  com_assistants_code_interpreter_files: {
    english: 'The following files are only available for Code Interpreter:',
    translated: 'Os seguintes arquivos estão disponíveis apenas para o Interpretador de Código:',
  },
  com_assistants_retrieval: {
    english: 'Retrieval',
    translated: 'Recuperação',
  },
  com_assistants_search_name: {
    english: 'Search assistants by name',
    translated: 'Pesquisar assistentes por nome',
  },
  com_ui_tools: {
    english: 'Tools',
    translated: 'Ferramentas',
  },
  com_assistants_actions: {
    english: 'Actions',
    translated: 'Ações',
  },
  com_assistants_add_tools: {
    english: 'Add Tools',
    translated: 'Adicionar Ferramentas',
  },
  com_assistants_add_actions: {
    english: 'Add Actions',
    translated: 'Adicionar Ações',
  },
  com_assistants_available_actions: {
    english: 'Available Actions',
    translated: 'Ações Disponíveis',
  },
  com_assistants_running_action: {
    english: 'Running action',
    translated: 'Executando ação',
  },
  com_assistants_completed_action: {
    english: 'Talked to {0}',
    translated: 'Falou com {0}',
  },
  com_assistants_completed_function: {
    english: 'Ran {0}',
    translated: 'Executou {0}',
  },
  com_assistants_function_use: {
    english: 'Assistant used {0}',
    translated: 'O Assistente usou {0}',
  },
  com_assistants_domain_info: {
    english: 'Assistant sent this info to {0}',
    translated: 'O Assistente enviou esta informação para {0}',
  },
  com_assistants_delete_actions_success: {
    english: 'Successfully deleted Action from Assistant',
    translated: 'Ação excluída do Assistente com sucesso',
  },
  com_assistants_update_actions_success: {
    english: 'Successfully created or updated Action',
    translated: 'Ação criada ou atualizada com sucesso',
  },
  com_assistants_update_actions_error: {
    english: 'There was an error creating or updating the action.',
    translated: 'Ocorreu um erro ao criar ou atualizar a ação.',
  },
  com_assistants_delete_actions_error: {
    english: 'There was an error deleting the action.',
    translated: 'Ocorreu um erro ao excluir a ação.',
  },
  com_assistants_actions_info: {
    english: 'Let your Assistant retrieve information or take actions via API\'s',
    translated: 'Permita que seu Assistente recupere informações ou execute ações via APIs',
  },
  com_assistants_name_placeholder: {
    english: 'Optional: The name of the assistant',
    translated: 'Opcional: O nome do assistente',
  },
  com_assistants_instructions_placeholder: {
    english: 'The system instructions that the assistant uses',
    translated: 'As instruções do sistema que o assistente usa',
  },
  com_assistants_description_placeholder: {
    english: 'Optional: Describe your Assistant here',
    translated: 'Opcional: Descreva seu Assistente aqui',
  },
  com_assistants_actions_disabled: {
    english: 'You need to create an assistant before adding actions.',
    translated: 'Você precisa criar um assistente antes de adicionar ações.',
  },
  com_assistants_update_success: {
    english: 'Successfully updated',
    translated: 'Atualizado com sucesso',
  },
  com_assistants_update_error: {
    english: 'There was an error updating your assistant.',
    translated: 'Ocorreu um erro ao atualizar seu assistente.',
  },
  com_assistants_create_success: {
    english: 'Successfully created',
    translated: 'Criado com sucesso',
  },
  com_assistants_create_error: {
    english: 'There was an error creating your assistant.',
    translated: 'Ocorreu um erro ao criar seu assistente.',
  },
  com_ui_attach_error_type: {
    english: 'Unsupported file type for endpoint:',
    translated: 'Tipo de arquivo não suportado para endpoint:',
  },
  com_ui_attach_error_size: {
    english: 'File size limit exceeded for endpoint:',
    translated: 'Limite de tamanho de arquivo excedido para endpoint:',
  },
  com_ui_attach_error: {
    english: 'Cannot attach file. Create or select a conversation, or try refreshing the page.',
    translated:
      'Não é possível anexar arquivo. Crie ou selecione uma conversa ou tente atualizar a página.',
  },
  com_ui_examples: {
    english: 'Examples',
    translated: 'Exemplos',
  },
  com_ui_new_chat: {
    english: 'New chat',
    translated: 'Nova Conversa',
  },
  com_ui_happy_birthday: {
    english: 'It\'s my 1st birthday!',
    translated: 'É meu 1º aniversário!',
  },
  com_ui_example_quantum_computing: {
    english: 'Explain quantum computing in simple terms',
    translated: 'Explique computação quântica em termos simples',
  },
  com_ui_example_10_year_old_b_day: {
    english: 'Got any creative ideas for a 10 year old\'s birthday?',
    translated: 'Tem alguma ideia criativa para o aniversário de 10 anos?',
  },
  com_ui_example_http_in_js: {
    english: 'How do I make an HTTP request in Javascript?',
    translated: 'Como faço uma requisição HTTP em Javascript?',
  },
  com_ui_capabilities: {
    english: 'Capabilities',
    translated: 'Capacidades',
  },
  com_ui_capability_remember: {
    english: 'Remembers what user said earlier in the conversation',
    translated: 'Lembra o que o usuário disse anteriormente na conversa',
  },
  com_ui_capability_correction: {
    english: 'Allows user to provide follow-up corrections',
    translated: 'Permite que o usuário forneça correções de acompanhamento',
  },
  com_ui_capability_decline_requests: {
    english: 'Trained to decline inappropriate requests',
    translated: 'Treinado para recusar solicitações inadequadas',
  },
  com_ui_limitations: {
    english: 'Limitations',
    translated: 'Limitações',
  },
  com_ui_limitation_incorrect_info: {
    english: 'May occasionally generate incorrect information',
    translated: 'Pode ocasionalmente gerar informações incorretas',
  },
  com_ui_limitation_harmful_biased: {
    english: 'May occasionally produce harmful instructions or biased content',
    translated: 'Pode ocasionalmente produzir instruções prejudiciais ou conteúdo enviesado',
  },
  com_ui_limitation_limited_2021: {
    english: 'Limited knowledge of world and events after 2021',
    translated: 'Conhecimento limitado do mundo e eventos após 2021',
  },
  com_ui_experimental: {
    english: 'Experimental Features',
    translated: 'Recursos Experimentais',
  },
  com_ui_ascending: {
    english: 'Asc',
    translated: 'Asc',
  },
  com_ui_descending: {
    english: 'Desc',
    translated: 'Desc',
  },
  com_ui_show_all: {
    english: 'Show All',
    translated: 'Mostrar Todos',
  },
  com_ui_name: {
    english: 'Name',
    translated: 'Nome',
  },
  com_ui_date: {
    english: 'Date',
    translated: 'Data',
  },
  com_ui_storage: {
    english: 'Storage',
    translated: 'Armazenamento',
  },
  com_ui_context: {
    english: 'Context',
    translated: 'Contexto',
  },
  com_ui_size: {
    english: 'Size',
    translated: 'Tamanho',
  },
  com_ui_host: {
    english: 'Host',
    translated: 'Host',
  },
  com_ui_update: {
    english: 'Update',
    translated: 'Atualizar',
  },
  com_ui_authentication: {
    english: 'Authentication',
    translated: 'Autenticação',
  },
  com_ui_instructions: {
    english: 'Instructions',
    translated: 'Instruções',
  },
  com_ui_description: {
    english: 'Description',
    translated: 'Descrição',
  },
  com_ui_error: {
    english: 'Error',
    translated: 'Erro',
  },
  com_ui_select: {
    english: 'Select',
    translated: 'Selecionar',
  },
  com_ui_input: {
    english: 'Input',
    translated: 'Entrada',
  },
  com_ui_close: {
    english: 'Close',
    translated: 'Fechar',
  },
  com_ui_model: {
    english: 'Model',
    translated: 'Modelo',
  },
  com_ui_select_model: {
    english: 'Select a model',
    translated: 'Selecionar um modelo',
  },
  com_ui_select_search_model: {
    english: 'Search model by name',
    translated: 'Pesquisar modelo por nome',
  },
  com_ui_select_search_plugin: {
    english: 'Search plugin by name',
    translated: 'Pesquisar plugin por nome',
  },
  com_ui_use_prompt: {
    english: 'Use prompt',
    translated: 'Usar prompt',
  },
  com_ui_prev: {
    english: 'Prev',
    translated: 'Ant',
  },
  com_ui_next: {
    english: 'Next',
    translated: 'Próx',
  },
  com_ui_stop: {
    english: 'Stop',
    translated: 'Parar',
  },
  com_ui_upload_files: {
    english: 'Upload files',
    translated: 'Carregar arquivos',
  },
  com_ui_prompt_templates: {
    english: 'Prompt Templates',
    translated: 'Modelos de Prompt',
  },
  com_ui_hide_prompt_templates: {
    english: 'Hide Prompt Templates',
    translated: 'Ocultar Modelos de Prompt',
  },
  com_ui_showing: {
    english: 'Showing',
    translated: 'Mostrando',
  },
  com_ui_of: {
    english: 'of',
    translated: 'de',
  },
  com_ui_entries: {
    english: 'Entries',
    translated: 'Entradas',
  },
  com_ui_pay_per_call: {
    english: 'All AI conversations in one place. Pay per call and not per month',
    translated: 'Todas as conversas de IA em um só lugar. Pague por chamada e não por mês',
  },
  com_ui_new_footer: {
    english: 'All AI conversations in one place.',
    translated: 'Todas as conversas de IA em um só lugar.',
  },
  com_ui_enter: {
    english: 'Enter',
    translated: 'Entrar',
  },
  com_ui_submit: {
    english: 'Submit',
    translated: 'Enviar',
  },
  com_ui_upload_success: {
    english: 'Successfully uploaded file',
    translated: 'Arquivo carregado com sucesso',
  },
  com_ui_upload_error: {
    english: 'There was an error uploading your file',
    translated: 'Ocorreu um erro ao carregar seu arquivo',
  },
  com_ui_cancel: {
    english: 'Cancel',
    translated: 'Cancelar',
  },
  com_ui_save: {
    english: 'Save',
    translated: 'Salvar',
  },
  com_ui_save_submit: {
    english: 'Save & Submit',
    translated: 'Salvar & Enviar',
  },
  com_user_message: {
    english: 'You',
    translated: 'Você',
  },
  com_ui_copy_to_clipboard: {
    english: 'Copy to clipboard',
    translated: 'Copiar para a área de transferência',
  },
  com_ui_copied_to_clipboard: {
    english: 'Copied to clipboard',
    translated: 'Copiado para a área de transferência',
  },
  com_ui_regenerate: {
    english: 'Regenerate',
    translated: 'Regenerar',
  },
  com_ui_continue: {
    english: 'Continue',
    translated: 'Continuar',
  },
  com_ui_edit: {
    english: 'Edit',
    translated: 'Editar',
  },
  com_ui_success: {
    english: 'Success',
    translated: 'Sucesso',
  },
  com_ui_all: {
    english: 'all',
    translated: 'todos',
  },
  com_ui_clear: {
    english: 'Clear',
    translated: 'Limpar',
  },
  com_ui_revoke: {
    english: 'Revoke',
    translated: 'Revogar',
  },
  com_ui_revoke_info: {
    english: 'Revoke all user provided credentials',
    translated: 'Revogar todas as credenciais fornecidas pelo usuário',
  },
  com_ui_import_conversation: {
    english: 'Import',
    translated: 'Importar',
  },
  com_ui_import_conversation_info: {
    english: 'Import conversations from a JSON file',
    translated: 'Importe conversas de um arquivo JSON',
  },
  com_ui_import_conversation_success: {
    english: 'Conversations imported successfully',
    translated: 'Conversas importadas com sucesso',
  },
  com_ui_import_conversation_error: {
    english: 'There was an error importing your conversations',
    translated: 'Houve um erro ao importar suas conversas',
  },
  com_ui_confirm_action: {
    english: 'Confirm Action',
    translated: 'Confirmar Ação',
  },
  com_ui_chats: {
    english: 'chats',
    translated: 'conversas',
  },
  com_ui_avatar: {
    english: 'Avatar',
    translated: 'Avatar',
  },
  com_ui_unknown: {
    english: 'Unknown',
    translated: 'Desconhecido',
  },
  com_ui_result: {
    english: 'Result',
    translated: 'Resultado',
  },
  com_ui_image_gen: {
    english: 'Image Gen',
    translated: 'Geração de Imagem',
  },
  com_ui_assistant: {
    english: 'Assistant',
    translated: 'Assistente',
  },
  com_ui_assistants: {
    english: 'Assistants',
    translated: 'Assistentes',
  },
  com_ui_attachment: {
    english: 'Attachment',
    translated: 'Anexo',
  },
  com_ui_assistants_output: {
    english: 'Assistants Output',
    translated: 'Saída dos Assistentes',
  },
  com_ui_delete: {
    english: 'Delete',
    translated: 'Excluir',
  },
  com_ui_create: {
    english: 'Create',
    translated: 'Criar',
  },
  com_ui_share: {
    english: 'Share',
    translated: 'Compartilhar',
  },
  com_ui_copy_link: {
    english: 'Copy link',
    translated: 'Copiar link',
  },
  com_ui_update_link: {
    english: 'Update link',
    translated: 'Atualizar link',
  },
  com_ui_create_link: {
    english: 'Create link',
    translated: 'Criar link',
  },
  com_ui_share_link_to_chat: {
    english: 'Share link to chat',
    translated: 'Compartilhar link no chat',
  },
  com_ui_share_retrieve_error: {
    english: 'There was an error deleting the shared link.',
    translated: 'Ocorreu um erro ao excluir o link compartilhado.',
  },
  com_ui_share_delete_error: {
    english: 'There was an error deleting the shared link.',
    translated: 'Ocorreu um erro ao excluir o link compartilhado.',
  },
  com_ui_share_error: {
    english: 'There was an error sharing the chat link',
    translated: 'Ocorreu um erro ao compartilhar o link do chat',
  },
  com_ui_share_create_message: {
    english: 'Your name and any messages you add after sharing stay private.',
    translated:
      'Seu nome e quaisquer mensagens que você adicionar após o compartilhamento permanecem privadas.',
  },
  com_ui_share_created_message: {
    english:
      'A shared link to your chat has been created. Manage previously shared chats at any time via Settings.',
    translated:
      'Um link compartilhado para o seu chat foi criado. Gerencie conversas compartilhadas previamente a qualquer momento via Configurações.',
  },
  com_ui_share_update_message: {
    english: 'Your name, custom instructions, and any messages you add after sharing stay private.',
    translated:
      'Seu nome, instruções personalizadas e quaisquer mensagens que você adicionar após o compartilhamento permanecem privadas.',
  },
  com_ui_share_updated_message: {
    english:
      'A shared link to your chat has been updated. Manage previously shared chats at any time via Settings.',
    translated:
      'Um link compartilhado para o seu chat foi atualizado. Gerencie conversas compartilhadas previamente a qualquer momento via Configurações.',
  },
  com_ui_shared_link_not_found: {
    english: 'Shared link not found',
    translated: 'Link compartilhado não encontrado',
  },
  com_ui_delete_conversation: {
    english: 'Delete chat?',
    translated: 'Excluir conversa?',
  },
  com_ui_delete_confirm: {
    english: 'This will delete',
    translated: 'Isso excluirá',
  },
  com_ui_delete_assistant_confirm: {
    english: 'Are you sure you want to delete this Assistant? This cannot be undone.',
    translated:
      'Tem certeza de que deseja excluir este Assistente? Esta ação não pode ser desfeita.',
  },
  com_ui_rename: {
    english: 'Rename',
    translated: 'Renomear',
  },
  com_ui_archive: {
    english: 'Archive',
    translated: 'Arquivar',
  },
  com_ui_archive_error: {
    english: 'Failed to archive conversation',
    translated: 'Ocorreu um erro ao arquivar a conversa.',
  },
  com_ui_unarchive: {
    english: 'Unarchive',
    translated: 'Desarquivar',
  },
  com_ui_unarchive_error: {
    english: 'Failed to unarchive conversation',
    translated: 'Ocorreu um erro ao desarquivar a conversa.',
  },
  com_ui_more_options: {
    english: 'More',
    translated: 'Mais',
  },
  com_ui_preview: {
    english: 'Preview',
    translated: 'Visualizar',
  },
  com_ui_upload: {
    english: 'Upload',
    translated: 'Carregar',
  },
  com_ui_connect: {
    english: 'Connect',
    translated: 'Conectar',
  },
  com_ui_upload_delay: {
    english:
      'Uploading "{0}" is taking more time than anticipated. Please wait while the file finishes indexing for retrieval.',
    translated:
      'O envio de "{0}" está levando mais tempo do que o esperado. Aguarde enquanto o arquivo é indexado para recuperação.',
  },
  com_ui_privacy_policy: {
    english: 'Privacy policy',
    translated: 'Política de privacidade',
  },
  com_ui_terms_of_service: {
    english: 'Terms of service',
    translated: 'Termos de serviço',
  },
  com_ui_bookmarks: {
    english: 'Bookmarks',
    translated: 'Favoritos',
  },
  com_ui_bookmarks_rebuild: {
    english: 'Rebuild',
    translated: 'Reconstruir',
  },
  com_ui_bookmarks_new: {
    english: 'New Bookmark',
    translated: 'Novo Favorito',
  },
  com_ui_bookmark_delete_confirm: {
    english: 'Are you sure you want to delete this bookmark?',
    translated: 'Tem certeza de que deseja excluir este favorito?',
  },
  com_ui_bookmarks_title: {
    english: 'Title',
    translated: 'Título',
  },
  com_ui_bookmarks_count: {
    english: 'Count',
    translated: 'Contagem',
  },
  com_ui_bookmarks_description: {
    english: 'Description',
    translated: 'Descrição',
  },
  com_ui_bookmarks_create_success: {
    english: 'Bookmark created successfully',
    translated: 'Favorito criado com sucesso',
  },
  com_ui_bookmarks_update_success: {
    english: 'Bookmark updated successfully',
    translated: 'Favorito atualizado com sucesso',
  },
  com_ui_bookmarks_delete_success: {
    english: 'Bookmark deleted successfully',
    translated: 'Favorito excluído com sucesso',
  },
  com_ui_bookmarks_create_error: {
    english: 'There was an error creating the bookmark',
    translated: 'Houve um erro ao criar o favorito',
  },
  com_ui_bookmarks_update_error: {
    english: 'There was an error updating the bookmark',
    translated: 'Houve um erro ao atualizar o favorito',
  },
  com_ui_bookmarks_delete_error: {
    english: 'There was an error deleting the bookmark',
    translated: 'Houve um erro ao excluir o favorito',
  },
  com_ui_bookmarks_add_to_conversation: {
    english: 'Add to current conversation',
    translated: 'Adicionar à conversa atual',
  },
  com_auth_error_login: {
    english:
      'Unable to login with the information provided. Please check your credentials and try again.',
    translated:
      'Não foi possível fazer login com as informações fornecidas. Por favor, verifique suas credenciais e tente novamente.',
  },
  com_auth_error_login_rl: {
    english: 'Too many login attempts in a short amount of time. Please try again later.',
    translated:
      'Muitas tentativas de login em um curto período de tempo. Por favor, tente novamente mais tarde.',
  },
  com_auth_error_login_ban: {
    english: 'Your account has been temporarily banned due to violations of our service.',
    translated: 'Sua conta foi temporariamente banida devido a violações de nosso serviço.',
  },
  com_auth_error_login_server: {
    english: 'There was an internal server error. Please wait a few moments and try again.',
    translated: 'Ocorreu um erro interno do servidor. Aguarde alguns instantes e tente novamente.',
  },
  com_auth_no_account: {
    english: 'Don\'t have an account?',
    translated: 'Não tem uma conta?',
  },
  com_auth_sign_up: {
    english: 'Sign up',
    translated: 'Inscrever-se',
  },
  com_auth_sign_in: {
    english: 'Sign in',
    translated: 'Entrar',
  },
  com_auth_google_login: {
    english: 'Continue with Google',
    translated: 'Continuar com o Google',
  },
  com_auth_facebook_login: {
    english: 'Continue with Facebook',
    translated: 'Continuar com o Facebook',
  },
  com_auth_github_login: {
    english: 'Continue with Github',
    translated: 'Continuar com o Github',
  },
  com_auth_discord_login: {
    english: 'Continue with Discord',
    translated: 'Continuar com o Discord',
  },
  com_auth_email: {
    english: 'Email',
    translated: 'Email',
  },
  com_auth_email_required: {
    english: 'Email is required',
    translated: 'O email é obrigatório',
  },
  com_auth_email_min_length: {
    english: 'Email must be at least 6 characters',
    translated: 'O email deve ter pelo menos 6 caracteres',
  },
  com_auth_email_max_length: {
    english: 'Email should not be longer than 120 characters',
    translated: 'O email não deve ter mais de 120 caracteres',
  },
  com_auth_email_pattern: {
    english: 'You must enter a valid email address',
    translated: 'Você deve inserir um endereço de email válido',
  },
  com_auth_email_address: {
    english: 'Email address',
    translated: 'Endereço de email',
  },
  com_auth_password: {
    english: 'Password',
    translated: 'Senha',
  },
  com_auth_password_required: {
    english: 'Password is required',
    translated: 'A senha é obrigatória',
  },
  com_auth_password_min_length: {
    english: 'Password must be at least 8 characters',
    translated: 'A senha deve ter pelo menos 8 caracteres',
  },
  com_auth_password_max_length: {
    english: 'Password must be less than 128 characters',
    translated: 'A senha deve ter menos de 128 caracteres',
  },
  com_auth_password_forgot: {
    english: 'Forgot Password?',
    translated: 'Esqueceu a Senha?',
  },
  com_auth_password_confirm: {
    english: 'Confirm password',
    translated: 'Confirmar senha',
  },
  com_auth_password_not_match: {
    english: 'Passwords do not match',
    translated: 'As senhas não correspondem',
  },
  com_auth_continue: {
    english: 'Continue',
    translated: 'Continuar',
  },
  com_auth_create_account: {
    english: 'Create your account',
    translated: 'Crie sua conta',
  },
  com_auth_error_create: {
    english: 'There was an error attempting to register your account. Please try again.',
    translated: 'Ocorreu um erro ao tentar registrar sua conta. Por favor, tente novamente.',
  },
  com_auth_full_name: {
    english: 'Full name',
    translated: 'Nome completo',
  },
  com_auth_name_required: {
    english: 'Name is required',
    translated: 'O nome é obrigatório',
  },
  com_auth_name_min_length: {
    english: 'Name must be at least 3 characters',
    translated: 'O nome deve ter pelo menos 3 caracteres',
  },
  com_auth_name_max_length: {
    english: 'Name must be less than 80 characters',
    translated: 'O nome deve ter menos de 80 caracteres',
  },
  com_auth_username: {
    english: 'Username (optional)',
    translated: 'Nome de usuário (opcional)',
  },
  com_auth_username_required: {
    english: 'Username is required',
    translated: 'O nome de usuário é obrigatório',
  },
  com_auth_username_min_length: {
    english: 'Username must be at least 2 characters',
    translated: 'O nome de usuário deve ter pelo menos 2 caracteres',
  },
  com_auth_username_max_length: {
    english: 'Username must be less than 20 characters',
    translated: 'O nome de usuário deve ter menos de 20 caracteres',
  },
  com_auth_already_have_account: {
    english: 'Already have an account?',
    translated: 'Já tem uma conta?',
  },
  com_auth_login: {
    english: 'Login',
    translated: 'Entrar',
  },
  com_auth_reset_password: {
    english: 'Reset your password',
    translated: 'Redefinir sua senha',
  },
  com_auth_click: {
    english: 'Click',
    translated: 'Clique',
  },
  com_auth_here: {
    english: 'HERE',
    translated: 'AQUI',
  },
  com_auth_to_reset_your_password: {
    english: 'to reset your password.',
    translated: 'para redefinir sua senha.',
  },
  com_auth_reset_password_link_sent: {
    english: 'Email Sent',
    translated: 'Email Enviado',
  },
  com_auth_reset_password_email_sent: {
    english: 'An email has been sent to you with further instructions to reset your password.',
    translated: 'Um email foi enviado para você com mais instruções para redefinir sua senha.',
  },
  com_auth_error_reset_password: {
    english:
      'There was a problem resetting your password. There was no user found with the email address provided. Please try again.',
    translated:
      'Houve um problema ao redefinir sua senha. Não foi encontrado nenhum usuário com o endereço de email fornecido. Por favor, tente novamente.',
  },
  com_auth_reset_password_success: {
    english: 'Password Reset Success',
    translated: 'Redefinição de Senha Bem-sucedida',
  },
  com_auth_login_with_new_password: {
    english: 'You may now login with your new password.',
    translated: 'Você pode agora fazer login com sua nova senha.',
  },
  com_auth_error_invalid_reset_token: {
    english: 'This password reset token is no longer valid.',
    translated: 'Este token de redefinição de senha não é mais válido.',
  },
  com_auth_click_here: {
    english: 'Click here',
    translated: 'Clique aqui',
  },
  com_auth_to_try_again: {
    english: 'to try again.',
    translated: 'para tentar novamente.',
  },
  com_auth_submit_registration: {
    english: 'Submit registration',
    translated: 'Enviar registro',
  },
  com_auth_welcome_back: {
    english: 'Welcome back',
    translated: 'Bem-vindo de volta',
  },
  com_auth_back_to_login: {
    english: 'Back to Login',
    translated: 'Voltar para Login',
  },
  com_endpoint_open_menu: {
    english: 'Open Menu',
    translated: 'Abrir Menu',
  },
  com_endpoint_bing_enable_sydney: {
    english: 'Enable Sydney',
    translated: 'Habilitar Sydney',
  },
  com_endpoint_bing_to_enable_sydney: {
    english: 'To enable Sydney',
    translated: 'Para habilitar Sydney',
  },
  com_endpoint_bing_jailbreak: {
    english: 'Jailbreak',
    translated: 'Jailbreak',
  },
  com_endpoint_bing_context_placeholder: {
    english:
      'Bing can use up to 7k tokens for \'context\', which it can reference for the conversation. The specific limit is not known but may run into errors exceeding 7k tokens',
    translated:
      'O Bing pode usar até 7k tokens para \'contexto\', que ele pode referenciar para a conversa. O limite específico não é conhecido, mas pode causar erros ao exceder 7k tokens',
  },
  com_endpoint_bing_system_message_placeholder: {
    english:
      'WARNING: Misuse of this feature can get you BANNED from using Bing! Click on \'System Message\' for full instructions and the default message if omitted, which is the \'Sydney\' preset that is considered safe.',
    translated:
      'AVISO: O uso indevido deste recurso pode fazer com que você seja BANIDO de usar o Bing! Clique em \'Mensagem do Sistem\' para obter instruções completas e a mensagem padrão, caso omitida, que é a predefinição \'Sydney\', considerada segura.',
  },
  com_endpoint_system_message: {
    english: 'System Message',
    translated: 'Mensagem do Sistema',
  },
  com_endpoint_message: {
    english: 'Message',
    translated: 'Conversar com',
  },
  com_endpoint_message_not_appendable: {
    english: 'Edit your message or Regenerate.',
    translated: 'Edite sua mensagem ou Regenere.',
  },
  com_endpoint_default_blank: {
    english: 'default: blank',
    translated: 'padrão: em branco',
  },
  com_endpoint_default_false: {
    english: 'default: false',
    translated: 'padrão: falso',
  },
  com_endpoint_default_creative: {
    english: 'default: creative',
    translated: 'padrão: criativo',
  },
  com_endpoint_default_empty: {
    english: 'default: empty',
    translated: 'padrão: vazio',
  },
  com_endpoint_default_with_num: {
    english: 'default: {0}',
    translated: 'padrão: {0}',
  },
  com_endpoint_context: {
    english: 'Context',
    translated: 'Contexto',
  },
  com_endpoint_tone_style: {
    english: 'Tone Style',
    translated: 'Estilo de Tom',
  },
  com_endpoint_token_count: {
    english: 'Token count',
    translated: 'Contagem de Tokens',
  },
  com_endpoint_output: {
    english: 'Output',
    translated: 'Saída',
  },
  com_endpoint_google_temp: {
    english:
      'Higher values = more random, while lower values = more focused and deterministic. We recommend altering this or Top P but not both.',
    translated:
      'Valores mais altos = mais aleatório, enquanto valores mais baixos = mais focado e determinístico. Recomendamos alterar este ou o Top P, mas não ambos.',
  },
  com_endpoint_google_topp: {
    english:
      'Top-p changes how the model selects tokens for output. Tokens are selected from most K (see topK parameter) probable to least until the sum of their probabilities equals the top-p value.',
    translated:
      'O Top-p altera a forma como o modelo seleciona tokens para a saída. Os tokens são selecionados do mais provável K (veja o parâmetro topK) para o menos provável até que a soma de suas probabilidades seja igual ao valor top-p.',
  },
  com_endpoint_google_topk: {
    english:
      'Top-k changes how the model selects tokens for output. A top-k of 1 means the selected token is the most probable among all tokens in the model\'s vocabulary (also called greedy decoding), while a top-k of 3 means that the next token is selected from among the 3 most probable tokens (using temperature).',
    translated:
      'O Top-k altera a forma como o modelo seleciona tokens para a saída. Um top-k de 1 significa que o token selecionado é o mais provável entre todos os tokens no vocabulário do modelo (também chamado de decodificação gulosa), enquanto um top-k de 3 significa que o próximo token é selecionado entre os 3 tokens mais prováveis (usando temperatura).',
  },
  com_endpoint_google_maxoutputtokens: {
    english:
      ' \tMaximum number of tokens that can be generated in the response. Specify a lower value for shorter responses and a higher value for longer responses.',
    translated:
      'Número máximo de tokens que podem ser gerados na resposta. Especifique um valor menor para respostas mais curtas e um valor maior para respostas mais longas.',
  },
  com_endpoint_google_custom_name_placeholder: {
    english: 'Set a custom name for Google',
    translated: 'Defina um nome personalizado para o Google',
  },
  com_endpoint_prompt_prefix_placeholder: {
    english: 'Set custom instructions or context. Ignored if empty.',
    translated: 'Defina instruções ou contexto personalizados. Ignorado se vazio.',
  },
  com_endpoint_instructions_assistants_placeholder: {
    english:
      'Overrides the instructions of the assistant. This is useful for modifying the behavior on a per-run basis.',
    translated:
      'Substitui as instruções do assistente. Isso é útil para modificar o comportamento em uma base por execução.',
  },
  com_endpoint_prompt_prefix_assistants_placeholder: {
    english:
      'Set additional instructions or context on top of the Assistant\'s main instructions. Ignored if empty.',
    translated:
      'Defina instruções ou contexto adicionais além das instruções principais do Assistente. Ignorado se vazio.',
  },
  com_endpoint_custom_name: {
    english: 'Custom Name',
    translated: 'Nome Personalizado',
  },
  com_endpoint_prompt_prefix: {
    english: 'Custom Instructions',
    translated: 'Instruções Personalizadas',
  },
  com_endpoint_prompt_prefix_assistants: {
    english: 'Additional Instructions',
    translated: 'Instruções Adicionais',
  },
  com_endpoint_instructions_assistants: {
    english: 'Override Instructions',
    translated: 'Substituir Instruções',
  },
  com_endpoint_temperature: {
    english: 'Temperature',
    translated: 'Temperatura',
  },
  com_endpoint_default: {
    english: 'default',
    translated: 'padrão',
  },
  com_endpoint_top_p: {
    english: 'Top P',
    translated: 'Top P',
  },
  com_endpoint_top_k: {
    english: 'Top K',
    translated: 'Top K',
  },
  com_endpoint_max_output_tokens: {
    english: 'Max Output Tokens',
    translated: 'Máx. Tokens de Saída',
  },
  com_endpoint_openai_temp: {
    english:
      'Higher values = more random, while lower values = more focused and deterministic. We recommend altering this or Top P but not both.',
    translated:
      'Valores mais altos = mais aleatório, enquanto valores mais baixos = mais focado e determinístico. Recomendamos alterar este ou o Top P, mas não ambos.',
  },
  com_endpoint_openai_max: {
    english:
      'The max tokens to generate. The total length of input tokens and generated tokens is limited by the model\'s context length.',
    translated:
      'O máximo de tokens a gerar. O comprimento total de tokens de entrada e tokens gerados é limitado pelo comprimento do contexto do modelo.',
  },
  com_endpoint_openai_topp: {
    english:
      'An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered. We recommend altering this or temperature but not both.',
    translated:
      'Uma alternativa à amostragem com temperatura, chamada amostragem de núcleo, onde o modelo considera os resultados dos tokens com massa de probabilidade top_p. Então, 0,1 significa que apenas os tokens que compõem os 10% superiores da massa de probabilidade são considerados. Recomendamos alterar este ou a temperatura, mas não ambos.',
  },
  com_endpoint_openai_freq: {
    english:
      'Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model\'s likelihood to repeat the same line verbatim.',
    translated:
      'Número entre -2,0 e 2,0. Valores positivos penalizam novos tokens com base em sua frequência existente no texto até agora, diminuindo a probabilidade do modelo repetir a mesma linha literalmente.',
  },
  com_endpoint_openai_pres: {
    english:
      'Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model\'s likelihood to talk about new topics.',
    translated:
      'Número entre -2,0 e 2,0. Valores positivos penalizam novos tokens com base em sua aparição no texto até o momento, aumentando a probabilidade do modelo falar sobre novos tópicos.',
  },
  com_endpoint_openai_resend: {
    english:
      'Resend all previously attached images. Note: this can significantly increase token cost and you may experience errors with many image attachments.',
    translated:
      'Reenviar todas as imagens anexadas anteriormente. Nota: isso pode aumentar significativamente o custo de tokens e você pode encontrar erros com muitos anexos de imagem.',
  },
  com_endpoint_openai_resend_files: {
    english:
      'Resend all previously attached files. Note: this will increase token cost and you may experience errors with many attachments.',
    translated:
      'Reenviar todos os arquivos anexados anteriormente. Nota: isso aumentará o custo de tokens e você pode encontrar erros com muitos anexos.',
  },
  com_endpoint_openai_detail: {
    english:
      'The resolution for Vision requests. "Low" is cheaper and faster, "High" is more detailed and expensive, and "Auto" will automatically choose between the two based on the image resolution.',
    translated:
      'A resolução para solicitações de Visão. "Baixa" é mais barata e rápida, "Alta" é mais detalhada e cara, e "Automática" escolherá automaticamente entre as duas com base na resolução da imagem.',
  },
  com_endpoint_openai_custom_name_placeholder: {
    english: 'Set a custom name for the AI',
    translated: 'Defina um nome personalizado para o ChatGPT',
  },
  com_endpoint_openai_prompt_prefix_placeholder: {
    english: 'Set custom instructions to include in System Message. Default: none',
    translated:
      'Defina instruções personalizadas para incluir na Mensagem do Sistema. Padrão: nenhuma',
  },
  com_endpoint_anthropic_temp: {
    english:
      'Ranges from 0 to 1. Use temp closer to 0 for analytical / multiple choice, and closer to 1 for creative and generative tasks. We recommend altering this or Top P but not both.',
    translated:
      'Varia de 0 a 1. Use temp mais próximo de 0 para tarefas analíticas/múltipla escolha e mais próximo de 1 para tarefas criativas e generativas. Recomendamos alterar este ou o Top P, mas não ambos.',
  },
  com_endpoint_anthropic_topp: {
    english:
      'Top-p changes how the model selects tokens for output. Tokens are selected from most K (see topK parameter) probable to least until the sum of their probabilities equals the top-p value.',
    translated:
      'O Top-p altera a forma como o modelo seleciona tokens para a saída. Os tokens são selecionados do mais provável K (veja o parâmetro topK) para o menos provável até que a soma de suas probabilidades seja igual ao valor top-p.',
  },
  com_endpoint_anthropic_topk: {
    english:
      'Top-k changes how the model selects tokens for output. A top-k of 1 means the selected token is the most probable among all tokens in the model\'s vocabulary (also called greedy decoding), while a top-k of 3 means that the next token is selected from among the 3 most probable tokens (using temperature).',
    translated:
      'O Top-k altera a forma como o modelo seleciona tokens para a saída. Um top-k de 1 significa que o token selecionado é o mais provável entre todos os tokens no vocabulário do modelo (também chamado de decodificação gulosa), enquanto um top-k de 3 significa que o próximo token é selecionado entre os 3 tokens mais prováveis (usando temperatura).',
  },
  com_endpoint_anthropic_maxoutputtokens: {
    english:
      'Maximum number of tokens that can be generated in the response. Specify a lower value for shorter responses and a higher value for longer responses.',
    translated:
      'Número máximo de tokens que podem ser gerados na resposta. Especifique um valor menor para respostas mais curtas e um valor maior para respostas mais longas.',
  },
  com_endpoint_anthropic_custom_name_placeholder: {
    english: 'Set a custom name for Anthropic',
    translated: 'Defina um nome personalizado para Anthropic',
  },
  com_endpoint_frequency_penalty: {
    english: 'Frequency Penalty',
    translated: 'Penalidade de Frequência',
  },
  com_endpoint_presence_penalty: {
    english: 'Presence Penalty',
    translated: 'Penalidade de Presença',
  },
  com_endpoint_plug_use_functions: {
    english: 'Use Functions',
    translated: 'Usar Funções',
  },
  com_endpoint_plug_resend_files: {
    english: 'Resend Files',
    translated: 'Reenviar Arquivos',
  },
  com_endpoint_plug_resend_images: {
    english: 'Resend Images',
    translated: 'Reenviar Imagens',
  },
  com_endpoint_plug_image_detail: {
    english: 'Image Detail',
    translated: 'Detalhe da Imagem',
  },
  com_endpoint_plug_skip_completion: {
    english: 'Skip Completion',
    translated: 'Ignorar Conclusão',
  },
  com_endpoint_disabled_with_tools: {
    english: 'disabled with tools',
    translated: 'desabilitado com ferramentas',
  },
  com_endpoint_disabled_with_tools_placeholder: {
    english: 'Disabled with Tools Selected',
    translated: 'Desabilitado com Ferramentas Selecionadas',
  },
  com_endpoint_plug_set_custom_instructions_for_gpt_placeholder: {
    english: 'Set custom instructions to include in System Message. Default: none',
    translated:
      'Defina instruções personalizadas para incluir na Mensagem do Sistema. Padrão: nenhuma',
  },
  com_endpoint_import: {
    english: 'Import',
    translated: 'Importar',
  },
  com_endpoint_set_custom_name: {
    english: 'Set a custom name, in case you can find this preset',
    translated: 'Defina um nome personalizado, caso você encontre esta predefinição',
  },
  com_endpoint_preset_delete_confirm: {
    english: 'Are you sure you want to delete this preset?',
    translated: 'Tem certeza de que deseja excluir esta predefinição?',
  },
  com_endpoint_preset_clear_all_confirm: {
    english: 'Are you sure you want to delete all of your presets?',
    translated: 'Tem certeza de que deseja excluir todas as suas predefinições?',
  },
  com_endpoint_preset_import: {
    english: 'Preset Imported!',
    translated: 'Predefinição Importada!',
  },
  com_endpoint_preset_import_error: {
    english: 'There was an error importing your preset. Please try again.',
    translated: 'Ocorreu um erro ao importar sua predefinição. Por favor, tente novamente.',
  },
  com_endpoint_preset_save_error: {
    english: 'There was an error saving your preset. Please try again.',
    translated: 'Ocorreu um erro ao salvar sua predefinição. Por favor, tente novamente.',
  },
  com_endpoint_preset_delete_error: {
    english: 'There was an error deleting your preset. Please try again.',
    translated: 'Ocorreu um erro ao excluir sua predefinição. Por favor, tente novamente.',
  },
  com_endpoint_preset_default_removed: {
    english: 'is no longer the default preset.',
    translated: 'não é mais a predefinição padrão.',
  },
  com_endpoint_preset_default_item: {
    english: 'Default:',
    translated: 'Padrão:',
  },
  com_endpoint_preset_default_none: {
    english: 'No default preset active.',
    translated: 'Nenhuma predefinição padrão ativa.',
  },
  com_endpoint_preset_title: {
    english: 'Preset',
    translated: 'Predefinição',
  },
  com_endpoint_preset_saved: {
    english: 'Saved!',
    translated: 'Salvo!',
  },
  com_endpoint_preset_default: {
    english: 'is now the default preset.',
    translated: 'é agora a predefinição padrão.',
  },
  com_endpoint_preset: {
    english: 'preset',
    translated: 'predefinição',
  },
  com_endpoint_presets: {
    english: 'presets',
    translated: 'predefinições',
  },
  com_endpoint_preset_selected: {
    english: 'Preset Active!',
    translated: 'Predefinição Ativa!',
  },
  com_endpoint_preset_selected_title: {
    english: 'Active!',
    translated: 'Ativa!',
  },
  com_endpoint_preset_name: {
    english: 'Preset Name',
    translated: 'Nome da Predefinição',
  },
  com_endpoint_new_topic: {
    english: 'New Topic',
    translated: 'Novo Tópico',
  },
  com_endpoint: {
    english: 'Endpoint',
    translated: 'Endpoint',
  },
  com_endpoint_hide: {
    english: 'Hide',
    translated: 'Ocultar',
  },
  com_endpoint_show: {
    english: 'Show',
    translated: 'Mostrar',
  },
  com_endpoint_examples: {
    english: ' Presets',
    translated: ' Predefinições',
  },
  com_endpoint_completion: {
    english: 'Completion',
    translated: 'Conclusão',
  },
  com_endpoint_agent: {
    english: 'Agent',
    translated: 'Agente',
  },
  com_endpoint_show_what_settings: {
    english: 'Show {0} Settings',
    translated: 'Mostrar Configurações de {0}',
  },
  com_endpoint_export: {
    english: 'Export',
    translated: 'Exportar',
  },
  com_endpoint_assistant: {
    english: 'Assistant',
    translated: 'Assistente',
  },
  com_endpoint_use_active_assistant: {
    english: 'Use Active Assistant',
    translated: 'Usar Assistente Ativo',
  },
  com_endpoint_assistant_model: {
    english: 'Assistant Model',
    translated: 'Modelo de Assistente',
  },
  com_endpoint_save_as_preset: {
    english: 'Save As Preset',
    translated: 'Salvar como Predefinição',
  },
  com_endpoint_presets_clear_warning: {
    english: 'Are you sure you want to clear all presets? This is irreversible.',
    translated: 'Tem certeza de que deseja limpar todas as predefinições? Isso é irreversível.',
  },
  com_endpoint_not_implemented: {
    english: 'Not implemented',
    translated: 'Não implementado',
  },
  com_endpoint_no_presets: {
    english: 'No presets yet, use the settings button to create one',
    translated: 'Nenhuma predefinição ainda, use o botão de configurações para criar uma',
  },
  com_endpoint_not_available: {
    english: 'No endpoint available',
    translated: 'Nenhum endpoint disponível',
  },
  com_endpoint_view_options: {
    english: 'View Options',
    translated: 'Opções de Visualização',
  },
  com_endpoint_save_convo_as_preset: {
    english: 'Save Conversation as Preset',
    translated: 'Salvar Conversa como Predefinição',
  },
  com_endpoint_my_preset: {
    english: 'My Preset',
    translated: 'Minha Predefinição',
  },
  com_endpoint_agent_model: {
    english: 'Agent Model (Recommended: GPT-3.5)',
    translated: 'Modelo de Agente (Recomendado: GPT-3.5)',
  },
  com_endpoint_completion_model: {
    english: 'Completion Model (Recommended: GPT-4)',
    translated: 'Modelo de Conclusão (Recomendado: GPT-4)',
  },
  com_endpoint_func_hover: {
    english: 'Enable use of Plugins as OpenAI Functions',
    translated: 'Habilitar o uso de Plugins como Funções OpenAI',
  },
  com_endpoint_skip_hover: {
    english:
      'Enable skipping the completion step, which reviews the final answer and generated steps',
    translated:
      'Habilitar a ignorância da etapa de conclusão, que revisa a resposta final e as etapas geradas',
  },
  com_endpoint_config_key: {
    english: 'Set API Key',
    translated: 'Definir Chave API',
  },
  com_endpoint_assistant_placeholder: {
    english: 'Please select an Assistant from the right-hand Side Panel',
    translated: 'Por favor, selecione um Assistente no Painel Lateral Direito',
  },
  com_endpoint_config_placeholder: {
    english: 'Set your Key in the Header menu to chat.',
    translated: 'Defina sua Chave no menu Cabeçalho para conversar.',
  },
  com_endpoint_config_key_for: {
    english: 'Set API Key for',
    translated: 'Definir Chave API para',
  },
  com_endpoint_config_key_name: {
    english: 'Key',
    translated: 'Chave',
  },
  com_endpoint_config_value: {
    english: 'Enter value for',
    translated: 'Digite o valor para',
  },
  com_endpoint_config_key_name_placeholder: {
    english: 'Set API key first',
    translated: 'Defina a chave API primeiro',
  },
  com_endpoint_config_key_encryption: {
    english: 'Your key will be encrypted and deleted at',
    translated: 'Sua chave será criptografada e excluída em',
  },
  com_endpoint_config_key_expiry: {
    english: 'the expiry time',
    translated: 'o tempo de expiração',
  },
  com_endpoint_config_click_here: {
    english: 'Click Here',
    translated: 'Clique Aqui',
  },
  com_endpoint_config_google_service_key: {
    english: 'Google Service Account Key',
    translated: 'Chave de Conta de Serviço do Google',
  },
  com_endpoint_config_google_cloud_platform: {
    english: '(from Google Cloud Platform)',
    translated: '(da Google Cloud Platform)',
  },
  com_endpoint_config_google_api_key: {
    english: 'Google API Key',
    translated: 'Chave API do Google',
  },
  com_endpoint_config_google_gemini_api: {
    english: '(Gemini API)',
    translated: '(API Gemini)',
  },
  com_endpoint_config_google_api_info: {
    english: 'To get your Generative Language API key (for Gemini),',
    translated: 'Para obter sua chave da API de Linguagem Generativa (para Gemini),',
  },
  com_endpoint_config_key_import_json_key: {
    english: 'Import Service Account JSON Key.',
    translated: 'Importar Chave JSON da Conta de Serviço.',
  },
  com_endpoint_config_key_import_json_key_success: {
    english: 'Successfully Imported Service Account JSON Key',
    translated: 'Chave JSON da Conta de Serviço Importada com Sucesso',
  },
  com_endpoint_config_key_import_json_key_invalid: {
    english: 'Invalid Service Account JSON Key, Did you import the correct file?',
    translated: 'Chave JSON da Conta de Serviço Inválida, Você importou o arquivo correto?',
  },
  com_endpoint_config_key_get_edge_key: {
    english: 'To get your Access token for Bing, login to',
    translated: 'Para obter seu Token de Acesso para o Bing, faça login em',
  },
  com_endpoint_config_key_get_edge_key_dev_tool: {
    english:
      'Use dev tools or an extension while logged into the site to copy the content of the _U cookie. If this fails, follow these',
    translated:
      'Use as ferramentas de desenvolvimento ou uma extensão enquanto estiver logado no site para copiar o conteúdo do cookie _U. Se isso falhar, siga estas',
  },
  com_endpoint_config_key_edge_instructions: {
    english: 'instructions',
    translated: 'instruções',
  },
  com_endpoint_config_key_edge_full_key_string: {
    english: 'to provide the full cookie strings.',
    translated: 'para fornecer as strings completas de cookies.',
  },
  com_endpoint_config_key_chatgpt: {
    english: 'To get your Access token For ChatGPT \'Free Version\', login to',
    translated: 'Para obter seu Token de Acesso para o ChatGPT \'Versão Gratuita\', faça login em',
  },
  com_endpoint_config_key_chatgpt_then_visit: {
    english: 'then visit',
    translated: 'então visite',
  },
  com_endpoint_config_key_chatgpt_copy_token: {
    english: 'Copy access token.',
    translated: 'Copiar token de acesso.',
  },
  com_endpoint_config_key_google_need_to: {
    english: 'You need to',
    translated: 'Você precisa',
  },
  com_endpoint_config_key_google_vertex_ai: {
    english: 'Enable Vertex AI',
    translated: 'Habilitar o Vertex AI',
  },
  com_endpoint_config_key_google_vertex_api: {
    english: 'API on Google Cloud, then',
    translated: 'API no Google Cloud, então',
  },
  com_endpoint_config_key_google_service_account: {
    english: 'Create a Service Account',
    translated: 'Criar uma Conta de Serviço',
  },
  com_endpoint_config_key_google_vertex_api_role: {
    english:
      'Make sure to click \'Create and Continue\' to give at least the \'Vertex AI User\' role. Lastly, create a JSON key to import here.',
    translated:
      'Certifique-se de clicar em \'Criar e Continuar\' para dar pelo menos a função \'Usuário do Vertex AI\'. Por último, crie uma chave JSON para importar aqui.',
  },
  com_nav_welcome_assistant: {
    english: 'Please Select an Assistant',
    translated: 'Por favor, Selecione um Assistente',
  },
  com_nav_welcome_message: {
    english: 'How can I help you today?',
    translated: 'Como posso ajudar você hoje?',
  },
  com_nav_auto_scroll: {
    english: 'Auto-Scroll to latest message on chat open',
    translated: 'Auto-rolagem para o mais recente ao abrir',
  },
  com_nav_hide_panel: {
    english: 'Hide right-most side panel',
    translated: 'Ocultar painel mais à direita',
  },
  com_nav_enter_to_send: {
    english: 'Press Enter to send messages',
    translated: 'Enviar Mensagem com a Tecla Enter',
  },
  com_nav_modular_chat: {
    english: 'Enable switching Endpoints mid-conversation',
    translated: 'Habilitar troca de Endpoints durante a conversa',
  },
  com_nav_latex_parsing: {
    english: 'Parsing LaTeX in messages (may affect performance)',
    translated: 'Analisando LaTeX nas mensagens (pode afetar o desempenho)',
  },
  com_nav_profile_picture: {
    english: 'Profile Picture',
    translated: 'Foto de perfil',
  },
  com_nav_change_picture: {
    english: 'Change picture',
    translated: 'Alterar foto',
  },
  com_nav_plugin_store: {
    english: 'Plugin store',
    translated: 'Loja de plugins',
  },
  com_nav_plugin_install: {
    english: 'Install',
    translated: 'Instalar',
  },
  com_nav_plugin_uninstall: {
    english: 'Uninstall',
    translated: 'Desinstalar',
  },
  com_ui_add: {
    english: 'Add',
    translated: 'Adicionar',
  },
  com_nav_tool_remove: {
    english: 'Remove',
    translated: 'Remover',
  },
  com_nav_tool_dialog: {
    english: 'Assistant Tools',
    translated: 'Ferramentas do Assistente',
  },
  com_nav_tool_dialog_description: {
    english: 'Assistant must be saved to persist tool selections.',
    translated: 'O Assistente deve ser salvo para persistir nas seleções de ferramentas.',
  },
  com_show_agent_settings: {
    english: 'Show Agent Settings',
    translated: 'Mostrar configurações do agente',
  },
  com_show_completion_settings: {
    english: 'Show Completion Settings',
    translated: 'Mostrar configurações de conclusão',
  },
  com_hide_examples: {
    english: 'Hide Examples',
    translated: 'Ocultar exemplos',
  },
  com_show_examples: {
    english: 'Show Examples',
    translated: 'Mostrar exemplos',
  },
  com_nav_plugin_search: {
    english: 'Search plugins',
    translated: 'Pesquisar plugins',
  },
  com_nav_tool_search: {
    english: 'Search tools',
    translated: 'Pesquisar ferramentas',
  },
  com_nav_plugin_auth_error: {
    english: 'There was an error attempting to authenticate this plugin. Please try again.',
    translated: 'Houve um erro ao tentar autenticar este plugin. Por favor, tente novamente.',
  },
  com_nav_export_filename: {
    english: 'Filename',
    translated: 'Nome do arquivo',
  },
  com_nav_export_filename_placeholder: {
    english: 'Set the filename',
    translated: 'Definir o nome do arquivo',
  },
  com_nav_export_type: {
    english: 'Type',
    translated: 'Tipo',
  },
  com_nav_export_include_endpoint_options: {
    english: 'Include endpoint options',
    translated: 'Incluir opções de endpoint',
  },
  com_nav_enabled: {
    english: 'Enabled',
    translated: 'Habilitado',
  },
  com_nav_not_supported: {
    english: 'Not Supported',
    translated: 'Não Suportado',
  },
  com_nav_export_all_message_branches: {
    english: 'Export all message branches',
    translated: 'Exportar todos os ramos de mensagens',
  },
  com_nav_export_recursive_or_sequential: {
    english: 'Recursive or sequential?',
    translated: 'Recursivo ou sequencial?',
  },
  com_nav_export_recursive: {
    english: 'Recursive',
    translated: 'Recursivo',
  },
  com_nav_export_conversation: {
    english: 'Export conversation',
    translated: 'Exportar conversa',
  },
  com_nav_export: {
    english: 'Export',
    translated: 'Exportar',
  },
  com_nav_shared_links: {
    english: 'Shared links',
    translated: 'Links Compartilhados',
  },
  com_nav_shared_links_manage: {
    english: 'Manage',
    translated: 'Gerenciar',
  },
  com_nav_shared_links_empty: {
    english: 'You have no shared links.',
    translated: 'Você não tem nenhum link compartilhado.',
  },
  com_nav_shared_links_name: {
    english: 'Name',
    translated: 'Nome',
  },
  com_nav_shared_links_date_shared: {
    english: 'Date shared',
    translated: 'Data compartilhada',
  },
  com_nav_my_files: {
    english: 'My Files',
    translated: 'Meus arquivos',
  },
  com_nav_theme: {
    english: 'Theme',
    translated: 'Tema',
  },
  com_nav_theme_system: {
    english: 'System',
    translated: 'Sistema',
  },
  com_nav_theme_dark: {
    english: 'Dark',
    translated: 'Escuro',
  },
  com_nav_theme_light: {
    english: 'Light',
    translated: 'Claro',
  },
  com_nav_font_size: {
    english: 'Font Size',
    translated: 'Tamanho da fonte',
  },
  com_nav_user_name_display: {
    english: 'Display username in messages',
    translated: 'Exibir nome de usuário nas mensagens',
  },
  com_nav_save_drafts: {
    english: 'Save drafts locally',
    translated: 'Salvar rascunhos localmente',
  },
  com_nav_show_code: {
    english: 'Always show code when using code interpreter',
    translated: 'Sempre mostrar código ao usar o interpretador de código',
  },
  com_nav_clear_all_chats: {
    english: 'Clear all chats',
    translated: 'Limpar todas as conversas',
  },
  com_nav_confirm_clear: {
    english: 'Confirm Clear',
    translated: 'Confirmar Limpeza',
  },
  com_nav_close_sidebar: {
    english: 'Close sidebar',
    translated: 'Fechar barra lateral',
  },
  com_nav_open_sidebar: {
    english: 'Open sidebar',
    translated: 'Abrir barra lateral',
  },
  com_nav_send_message: {
    english: 'Send message',
    translated: 'Enviar mensagem',
  },
  com_nav_log_out: {
    english: 'Log out',
    translated: 'Sair',
  },
  com_nav_user: {
    english: 'USER',
    translated: 'USUÁRIO',
  },
  com_nav_archived_chats: {
    english: 'Archived chats',
    translated: 'Conversas Arquivadas',
  },
  com_nav_archived_chats_manage: {
    english: 'Manage',
    translated: 'Gerenciar',
  },
  com_nav_archived_chats_empty: {
    english: 'You have no archived conversations.',
    translated: 'Você não tem nenhuma conversa arquivada.',
  },
  com_nav_archive_all_chats: {
    english: 'Archive all chats',
    translated: 'Arquivar todas as conversas',
  },
  com_nav_archive_all: {
    english: 'Archive all',
    translated: 'Arquivar todas',
  },
  com_nav_archive_name: {
    english: 'Name',
    translated: 'Nome',
  },
  com_nav_archive_created_at: {
    english: 'DateCreated',
    translated: 'CriadoEm',
  },
  com_nav_clear_conversation: {
    english: 'Clear conversations',
    translated: 'Limpar conversas',
  },
  com_nav_clear_conversation_confirm_message: {
    english: 'Are you sure you want to clear all conversations? This is irreversible.',
    translated: 'Tem certeza de que deseja limpar todas as conversas? Isso é irreversível.',
  },
  com_nav_help_faq: {
    english: 'Help & FAQ',
    translated: 'Ajuda & FAQ',
  },
  com_nav_settings: {
    english: 'Settings',
    translated: 'Configurações',
  },
  com_nav_search_placeholder: {
    english: 'Search messages',
    translated: 'Pesquisar mensagens',
  },
  com_nav_info_bookmarks_rebuild: {
    english:
      'If the bookmark count is incorrect, please rebuild the bookmark information. The bookmark count will be recalculated and the data will be restored to its correct state.',
    translated:
      'Se a contagem de favoritos estiver incorreta, por favor, reconstrua as informações de favoritos. A contagem de favoritos será recalculada e os dados serão restaurados ao estado correto.',
  },
  com_nav_setting_general: {
    english: 'General',
    translated: 'Geral',
  },
  com_nav_setting_beta: {
    english: 'Beta features',
    translated: 'Recursos beta',
  },
  com_nav_setting_data: {
    english: 'Data controls',
    translated: 'Controles de dados',
  },
  com_nav_setting_account: {
    english: 'Account',
    translated: 'Conta',
  },
  com_nav_language: {
    english: 'Language',
    translated: 'Idioma',
  },
  com_nav_lang_auto: {
    english: 'Auto detect',
    translated: 'Detecção automática',
  },
  com_nav_lang_brazilian_portuguese: {
    english: 'Português Brasileiro',
    translated: 'Português Brasileiro',
  },
	com_nav_lang_catala:  {
    english: 'Catalan', 
    translated: 'Català',  
  }
};
