UI.registerHelper("equals", function (a, b) {
  return (a == b);
});

UI.registerHelper("distribution", function (a, b) {
  if (isNaN(100 / b * a))
    return 0;
  else
    return (100 / b * a);
});

UI.registerHelper("avoidQuestionUpdate", function () {
    return Meteor.settings.public.avoidQuestionUpdate;
});

UI.registerHelper("avoidQuestionRemove", function () {
    return Meteor.settings.public.avoidQuestionRemove;
});