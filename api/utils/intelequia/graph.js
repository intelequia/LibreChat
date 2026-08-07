async function saveGraphToken(token, user) {
    global.myCache.set(user.email.toString() + '-graph', token, process.env.USER_GROUPS_CACHE_TTL);
}

module.exports = {
    saveGraphToken,
};
