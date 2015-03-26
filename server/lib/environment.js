Sanitizer = Meteor.npmRequire('sanitize-html');
Natural = Meteor.npmRequire('natural');
Fs = Meteor.npmRequire('fs');

logger = Meteor.npmRequire('winston');

Papertrail = Meteor.npmRequire('winston-papertrail').Papertrail;
logger.add(Papertrail, {
  host: "logs2.papertrailapp.com",
  port: 50068, //this will be change from the papertrail account to account
  logFormat: function(level, message) {
      return '[' + level + '] ' + message;
  },
  inlineMeta: true,
  level: Meteor.settings.papertrayLogLevel
});

logger.level = Meteor.settings.globalLogLevel;

logger.info('Logger started');
