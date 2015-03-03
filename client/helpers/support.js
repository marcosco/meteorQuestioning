UI.registerHelper("equals", function (a, b) {
  return (a == b);
});

UI.registerHelper("distribution", function (a, b) {
  if (isNaN(100 / b * a))
    return 0;
  else
    return (100 / b * a);
})