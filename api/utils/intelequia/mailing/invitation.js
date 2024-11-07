const path = require('path');
require('module-alias')({ base: path.resolve(__dirname, '../../../../', 'api') });
const { askQuestion, silentExit } = require('~/../config/helpers');
const User = require('~/models/User');
const connect = require('~/../config/connect');
const bcrypt = require('bcryptjs');
const { SystemRoles, errorsToString } = require('librechat-data-provider');
const {
  findUser,
  countUsers,
  createUser,
  updateUser,
  deleteUserById,
} = require('~/models/userMethods');
const { createToken } = require('~/models');
const { isEnabled, checkEmailConfig, sendEmail } = require('~/server/utils');
const { registerSchema } = require('~/strategies/validators');
const isDomainAllowed = require('~/server/services/isDomainAllowed.js');
const { logger } = require('~/config');

(async () => {
  await connect();

  console.purple('--------------------------');
  console.purple('Create a new user account!');
  console.purple('--------------------------');

  if (process.argv.length < 5) {
    console.orange('Usage: npm run create-demo-user <email> <name> <username>');
    console.orange('Note: if you do not pass in the arguments, you will be prompted for them.');
    console.orange(
      'If you really need to pass in the password, you can do so as the 4th argument (not recommended for security).',
    );
    console.purple('--------------------------');
  }

  let email = '';
  let password = '';
  let name = '';
  let username = '';
  let emailVerified = false;

  // Parse command line arguments
  for (let i = 2; i < process.argv.length; i++) {
   
    if (!email) {
      email = process.argv[i];
    } else if (!name) {
      name = process.argv[i];
    } else if (!username) {
      username = process.argv[i];
    } else if (!password) {
      console.red('Warning: password passed in as argument, this is not secure!');
      password = process.argv[i];
    }
  }

  if (!email) {
    email = await askQuestion('Email:');
  }
  if (!email.includes('@')) {
    console.red('Error: Invalid email address!');
    silentExit(1);
  }

  const defaultName = email.split('@')[0];
  if (!name) {
    name = await askQuestion('Name: (default is: ' + defaultName + ')');
    if (!name) {
      name = defaultName;
    }
  }
  if (!username) {
    username = await askQuestion('Username: (default is: ' + defaultName + ')');
    if (!username) {
      username = defaultName;
    }
  }
  if (!password) {
    password = await askQuestion('Password: (leave blank, to generate one)');
    if (!password) {
      password = Math.random().toString(36).slice(-18);
      console.orange('Your password is: ' + password);
    }
  }

  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    console.red('Error: A user with that email or username already exists!');
    silentExit(1);
  }

  const user = { email, password, name, username, confirm_password: password };
  let result;
  try {
    result = await registerUser(user, { emailVerified });
  } catch (error) {
    console.red('Error: ' + error.message);
    silentExit(1);
  }

  if (result.status !== 200) {
    console.red('Error: ' + result.message);
    silentExit(1);
  }

  const userCreated = await User.findOne({ $or: [{ email }, { username }] });
  if (userCreated) {
    console.green('User created successfully!');
    console.green(`Email verified: ${userCreated.emailVerified}`);
    silentExit(0);
  }
})();

process.on('uncaughtException', (err) => {
  if (!err.message.includes('fetch failed')) {
    console.error('There was an uncaught error:');
    console.error(err);
  }

  if (err.message.includes('fetch failed')) {
    return;
  } else {
    process.exit(1);
  }
});



/**
 * Register a new user.
 * @param {MongoUser} user <email, password, name, username>
 * @param {Partial<MongoUser>} [additionalData={}]
 * @returns {Promise<{status: number, message: string, user?: MongoUser}>}
 */
const registerUser = async (user, additionalData = {}) => {
  const { error } = registerSchema.safeParse(user);
  if (error) {
    const errorMessage = errorsToString(error.errors);
    logger.info(
      'Route: register - Validation Error',
      { name: 'Request params:', value: user },
      { name: 'Validation error:', value: errorMessage },
    );

    return { status: 404, message: errorMessage };
  }

  const { email, password, name, username } = user;

  let newUserId;
  try {
    const existingUser = await findUser({ email }, 'email _id');

    if (existingUser) {
      logger.info(
        'Register User - Email in use',
        { name: 'Request params:', value: user },
        { name: 'Existing user:', value: existingUser },
      );

      // Sleep for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { status: 200, message: "ok" };
    }

    if (!(await isDomainAllowed(email))) {
      const errorMessage =
        'The email address provided cannot be used. Please use a different email address.';
      logger.error(`[registerUser] [Registration not allowed] [Email: ${user.email}]`);
      return { status: 403, message: errorMessage };
    }

    //determine if this is the first registered user (not counting anonymous_user)
    const isFirstRegisteredUser = (await countUsers()) === 0;

    const salt = bcrypt.genSaltSync(10);
    const newUserData = {
      provider: 'local',
      email,
      username,
      name,
      avatar: null,
      role: isFirstRegisteredUser ? SystemRoles.ADMIN : SystemRoles.USER,
      password: bcrypt.hashSync(password, salt),
      ...additionalData,
    };

    const emailEnabled = checkEmailConfig();
    const disableTTL = isEnabled(process.env.ALLOW_UNVERIFIED_EMAIL_LOGIN);
    const newUser = await createUser(newUserData, disableTTL, true);
    newUserId = newUser._id;
    if (emailEnabled && !newUser.emailVerified) {
      await sendVerificationEmail({
        _id: newUserId,
        email,
        name,
      });
    } else {
      await updateUser(newUserId, { emailVerified: true });
    }

    return { status: 200, message: "ok" };
  } catch (err) {
    logger.error('[registerUser] Error in registering user:', err);
    if (newUserId) {
      const result = await deleteUserById(newUserId);
      logger.warn(
        `[registerUser] [Email: ${email}] [Temporary User deleted: ${JSON.stringify(result)}]`,
      );
    }
    return { status: 500, message: 'Something went wrong' };
  }
};

/**
 * Send Verification Email
 * @param {Partial<MongoUser> & { _id: ObjectId, email: string, name: string}} user
 * @returns {Promise<void>}
 */
const sendVerificationEmail = async (user) => {

  await sendEmail({
    email: user.email,
    subject: 'Welcome to Intelewriter',
    payload: {
      appName: 'Intelewriter',
      name: user.name,
      verificationLink: process.env.DOMAIN_CLIENT,
      year: new Date().getFullYear(),
    },
    template: 'intelequia.inviteUsers.handlebars',
  });

  logger.info(`[sendVerificationEmail] Verification link issued. [Email: ${user.email}] [link]`);
};
