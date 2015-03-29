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
      logger.info('A new interesting ' + argument + ' question has been added by ' + question.username);

      var behaviour = {
        user: question.owner,
        owner: question.owner,
        argument: argument,
        question: questionId,
        action: 'nQ'
      }

      Questioning.updateOwnerIgnorance(behaviour);
    });

    return questionId
  },

  updateIgnorance : function(behaviour) {
    question = Questions.findOne(behaviour.question);

    behaviour.owner = question.owner;
    if (behaviour.owner == behaviour.user) {
      Questioning.updateOwnerIgnorance(behaviour);      
    } else {
      Questioning.updatePartecipantIgnorance(behaviour);
    }
  },

  updateOwnerIgnorance : function (behaviour) {
    logger.debug("Performing ignorance update for user " + behaviour.user);

    var options = {
      user: behaviour.user,
      question: behaviour.question
    }

    actualIgnorance = Questioning.getIgnorance(options);

    previousIgnorance = actualIgnorance.classification

    switch (behaviour.action) {
      case 'nQ':
        logger.debug('New Question action performed');
        actualIgnorance.classification = "Known Unknowns";
        actualIgnorance.score += Meteor.settings.score.newQuestion;
        break;
      case 'aA':
        logger.debug('Accept Answer action performed');
        if (previousIgnorance == "Known Unknowns" || previousIgnorance == "Errors" || previousIgnorance == "Denials") {
          actualIgnorance.classification = "Known Knowns";
          actualIgnorance.score += Meteor.settings.score.acceptAnswer;
        }
        break;
      case 'gM':
        logger.debug('Get Minus action performed');
        actualIgnorance.score += Meteor.settings.score.getMinus;
        if (previousIgnorance == "Known Unknowns" && actualIgnorance.score < 0) {
          actualIgnorance.classification = "Errors";
        }
        break;
      case 'gP':
        logger.debug('Get Plus action performed');
        actualIgnorance.score += Meteor.settings.score.getPlus;
        if (previousIgnorance == "Errors" && actualIgnorance.score >= 0) {
          actualIgnorance.classification = "Known Unknowns";
        }
        break;
      case 'rA':
        logger.debug('Refuse Answer action performed');
        actualIgnorance.score += Meteor.settings.score.refuseAnswer;
        if (previousIgnorance == "Known Unknowns" || previousIgnorance == "Errors") {
          actualIgnorance.classification = "Denials";
        }
        break;
      case 'sA':
        logger.debug('Self Accept action performed');
        actualIgnorance.score += Meteor.settings.score.selfAccept;
        if (previousIgnorance == "Known Unknowns" || previousIgnorance == "Errors" || previousIgnorance == "Denials") {
          actualIgnorance.classification = "Unknown Knowns";
        }
        break;


      default:
        logger.debug('Action ' + behaviour.action + ' not implemented yet!')
        return false;
    }

    logger.debug('Owner '+ options.user +' ignorance is shifting from ' + previousIgnorance + ' to ' + actualIgnorance.classification);

    iid = actualIgnorance._id;
    classification = actualIgnorance.classification;
    score = actualIgnorance.score;
    user = actualIgnorance.user;

    try {
      if(actualIgnorance._id) {
        Ignorances.update(iid, {$set: {classification: classification, score: score}});
      } else {
        Ignorances.insert(actualIgnorance);
      }
    } catch(err) {
      logger.error(err);
    }

  },

  updatePartecipantIgnorance : function (behaviour) {
    logger.debug("Performing ignorance update for user " + behaviour.user);

    var options = {
      user: behaviour.user,
      question: behaviour.question
    }

    actualIgnorance = Questioning.getIgnorance(options);

    previousIgnorance = actualIgnorance.classification

    switch (behaviour.action) {
      case 'oQ':
        if (previousIgnorance == "Unknown Unknowns") {
          logger.debug('Open Question action performed');
          actualIgnorance.classification = "Known Unknowns";
          actualIgnorance.score += Meteor.settings.score.openQuestion;          
        }
        break;
      case 'gM':
        logger.debug('Get Minus action performed');
        actualIgnorance.score += Meteor.settings.score.getMinus;
        if (previousIgnorance == "Known Unknowns" && actualIgnorance.score < 0) {
          actualIgnorance.classification = "Errors";
        }
        break;
      case 'gP':
        logger.debug('Get Plus action performed');
        actualIgnorance.score += Meteor.settings.score.getPlus;
        if (previousIgnorance == "Errors" && actualIgnorance.score >= 0) {
          actualIgnorance.classification = "Known Unknowns";
        }
        break;
      case 'pM':
        logger.debug('Put Minus action performed');

        actualIgnorance.score += Meteor.settings.score.putMinus;
        if ((previousIgnorance == "Errors" || previousIgnorance == "Denials") && isAccepted) {
          logger.debug('On accepted Answer');
          actualIgnorance.classification = "Denials";
        }
        break;
      case 'pP':
        logger.debug('Put Plus action performed');
        actualIgnorance.score += Meteor.settings.score.putPlus;

        if ((previousIgnorance == "Errors" || previousIgnorance == "Denials") && isAccepted) {
          logger.debug('On accepted Answer');
          actualIgnorance.classification = "Known Knowns";
        }
        break;
      case 'aR':
        logger.debug('Add Answer action performed');
        actualIgnorance.score += Meteor.settings.score.addAnswer;
        actualIgnorance.classification = previousIgnorance;
        break;        
      case 'gA':
        logger.debug('Get Accepted action performed');
        actualIgnorance.score += Meteor.settings.score.getAccept;
        if (previousIgnorance == "Known Unknowns" || previousIgnorance == "Errors" || previousIgnorance == "Denials") {
          actualIgnorance.classification = "Known Knowns";
        }
        break;


      default:
        logger.debug('Action ' + behaviour.action + ' not implemented yet!')
        return false;
    }

    logger.debug('Partecipant '+ options.user +' ignorance is shifting from ' + previousIgnorance + ' to ' + actualIgnorance.classification);

    iid = actualIgnorance._id;
    classification = actualIgnorance.classification;
    score = actualIgnorance.score;
    user = actualIgnorance.user;

    try {
      if(actualIgnorance._id) {
        logger.debug("Updating Ignorance");
        Ignorances.update(iid, {$set: {classification: classification, score: score}});
      } else {
        logger.debug("Inserting Ignorance");
        Ignorances.insert(actualIgnorance);
      }
    } catch(err) {
      logger.error(err);
      return false;
    }

    return true;
  },
  getIgnorance : function (options) {
    ignorance = Ignorances.findOne(options);

    if (typeof(ignorance)==='undefined') {
      ignorance = {
        classification : "Unknown Unknowns",
        user : options.user,
        question : options.question,
        score : Meteor.settings.score.initial
      }    
    }

    return ignorance;
  },

  addAnswer : function (answer) {
    question = Questions.findOne(answer.question_id);

    var behaviour = {
      owner: question.owner,
      user: answer.owner,
      question: answer.question_id,
      action: 'oQ'
    }

    if (question.owner == answer.owner) {
      Questioning.updateOwnerIgnorance(behaviour);
    } else {
      Questioning.updatePartecipantIgnorance(behaviour);      
    }

    try {
      answerId = Answers.insert(answer);
      logger.debug("Answer " + answerId + " added");

      var behaviour = {
        owner: question.owner,
        user: answer.owner,
        question: answer.question_id,
        action: 'aR'
      }

      if (question.owner == answer.owner) {
        Questioning.updateOwnerIgnorance(behaviour);
      } else {
        Questioning.updatePartecipantIgnorance(behaviour);      
      }
      
    }
    catch(err) {
      logger.error(err);
    }

    return answerId;
  },

  setAccepted : function (options) {
    Answers.update( { _id: options.answer._id }, {$set: { is_accepted: true }} );
    Questions.update( { _id: options.question._id }, {$set: { is_answered: options.answer._id }} );

    logger.debug("Answer " + options.answer._id + " has been set has accepted answer for question " + options.question._id);

    if(options.answer.owner == options.question.owner) {
      var behaviour = {
        owner: question.owner,
        user: question.owner,
        question: question._id,
        action: 'sA'
      }
      Questioning.updateOwnerIgnorance(behaviour);
    } else {
        var behaviour = {
          owner: options.question.owner,
          user: options.question.owner,
          question: options.question._id,
          action: 'aA'
        }
        Questioning.updateOwnerIgnorance(behaviour);

        var behaviour = {
          owner: options.question.owner,
          user: options.answer.owner,
          question: options.question._id,
          action: 'gA'
        }
        Questioning.updatePartecipantIgnorance(behaviour);        
    };

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
