Questioning = {
  addQuestion : function (question) {
    try {
      questionId = Questions.insert(question);
      logger.debug("Question " + questionId + " added");      
    }
    catch(err) {
      logger.error(err);
    }

    _.intersection(question.tags, Meteor.settings.interestingTags).forEach(function(argument) {
      var entry = {
        argument: argument,
        question: questionId
      }
      Arguments.insert(entry);
      logger.info('A new interesting ' + argument + ' question has been added');
    });

    return questionId
  },

  addAnswer : function (answer) {
    try {
      answerId = Answers.insert(answer);
      logger.debug("Answer " + answerId + " added");      
    }
    catch(err) {
      logger.error(err);
    }

    return answerId;
  },

  updateClassifier : function (question) {
    Natural.LogisticRegressionClassifier.load('assets/app/classifier.json', null, function(err, classifier) {
      if (err) {
        return logger.error(err);
      }

      try {
        extractedTags = Tags.findFrom(question.title);

        for (var tt = 0, ttlen = question.tags.length; tt < ttlen; tt++) {
          classifier.addDocument(extractedTags.join(), question.tags[tt]);        
        }
        classifier.train();
        classifier.save('assets/app/classifier.json', function(err, classifier) {
          // the classifier is saved to the classifier.json file!
          if (err) {
            return logger.error(err);
          }

        });
    //        classifier.addDocument(extractedTags.join(), Question.tags[0]);
      }
      catch(err) {
        logger.error(err);
        logger.error("This text cause the error: " + question.title);
      }
    });
  }
}
