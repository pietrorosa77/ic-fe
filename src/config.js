const {
    API_GATEWAY_URL,
    STORAGE_BUCKET,
    GOOGLE_CLIENTID,
    LINKEDIN_CLIENTID,
    FACEBOOK_CLIENTID,
    LOGIN_RETURN_URL,
    GOOGLE_OAUTH,
    LINKEDIN_OAUTH,
    FACEBOOK_OAUTH
} = require('../appConfig.json');

export const config = {
    apiUrl: API_GATEWAY_URL,
    awsBucket: STORAGE_BUCKET,
    googleId: GOOGLE_CLIENTID,
    googleOAuthUrl: GOOGLE_OAUTH,
    googleScope: ['openid', 'email'],
    linkedinId: LINKEDIN_CLIENTID,
    linkedinOAuthUrl: LINKEDIN_OAUTH,
    linkedinScope: ['r_emailaddress', 'r_basicprofile'],
    facebookId: FACEBOOK_CLIENTID,
    facebookOAuthUrl: FACEBOOK_OAUTH,
    facebookScope: ['public_profile', 'email'],
    returnUrl: LOGIN_RETURN_URL
};
