/*
Questioning is a kind of BB system completely written using MeteorJS that
implements Ann Kerwin's Ignorance Map and a rewarding system to involve users.
Copyright (c) 2015, Author: Marco Scordino, Advisor: Paolo Ceravolo http://www.di.unimi.it/ceravolo/

This file is part of Questioning.

Questioning is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Questioning is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Questioning.  If not, see <http://www.gnu.org/licenses/>.
*/
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
      Questioning.updateArgumentMap(argument);
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

    Questioning.updateQuestionMap(questionId);

    return questionId
  },

  updateArgumentMap : function(argument) {
    distribution = Questioning.getIgnoranceDistributionByArgument(argument);

    if (Arguments.find({argument: argument}).count() != 0) {
      Arguments.update({argument: argument}, {$set: {distribution: distribution}});
    } else {
      Arguments.insert({argument: argument, distribution: distribution});
    }
  },

  updateQuestionMap : function(question_id) {
    distribution = Questioning.getIgnoranceDistributionByQuestion(question_id);
    Questions.update(question_id, {$set: {ignoranceMap: distribution.ignoranceMap}});
    logger.debug('Question ' + question_id + ' has updated map');
  },

  updateIgnorance : function(behaviour) {
    question = Questions.findOne(behaviour.question);

    behaviour.owner = question.owner;
    _.intersection(question.tags, Meteor.settings.interestingTags).forEach(function(argument) {
      behaviour.argument = argument;
      if (behaviour.owner == behaviour.user) {
        Questioning.updateOwnerIgnorance(behaviour);      
      } else {
        Questioning.updatePartecipantIgnorance(behaviour);
      }
    });
  },

  updateOwnerIgnorance : function (behaviour, isAccepted) {
    if (typeof(isAccepted)==='undefined') {
      isAccepted = false;
    }

    logger.debug("Performing ignorance update for owner user " + behaviour.user);

    var options = {
      user: behaviour.user,
      question: behaviour.question,
      argument: behaviour.argument      
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
      Questioning.updateQuestionMap(behaviour.question);
      Questioning.updateArgumentMap(behaviour.argument);        
    } catch(err) {
      logger.error(err);
    }

  },

  updatePartecipantIgnorance : function (behaviour, isAccepted) {
    if (typeof(isAccepted)==='undefined') {
      isAccepted = false;
    }

    logger.debug("Performing ignorance update for partecipant user " + behaviour.user);

    var options = {
      user: behaviour.user,
      question: behaviour.question,
      argument: behaviour.argument
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
        if ((previousIgnorance == "Known Unknowns" || previousIgnorance == "Errors" || previousIgnorance == "Denials") && isAccepted) {
          logger.debug('On accepted Answer');
          actualIgnorance.classification = "Denials";
        }
        break;
      case 'pP':
        logger.debug('Put Plus action performed');
        actualIgnorance.score += Meteor.settings.score.putPlus;

        if ((previousIgnorance == "Known Unknowns" || previousIgnorance == "Errors" || previousIgnorance == "Denials") && isAccepted) {
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
      Questioning.updateQuestionMap(behaviour.question);      
      Questioning.updateArgumentMap(behaviour.argument);                
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
        score : Meteor.settings.score.initial,
        argument : options.argument
      }    
    }

    return ignorance;
  },

  addAnswer : function (answer) {
    question = Questions.findOne(answer.question_id);

    _.intersection(question.tags, Meteor.settings.interestingTags).forEach(function(argument) {
      var behaviour = {
        owner: question.owner,
        user: answer.owner,
        question: answer.question_id,
        argument: argument,
        action: 'oQ'
      }

      if (question.owner == answer.owner) {
        Questioning.updateOwnerIgnorance(behaviour);
      } else {
        Questioning.updatePartecipantIgnorance(behaviour);      
      }
    });  

    try {
      answerId = Answers.insert(answer);
      logger.debug("Answer " + answerId + " added");

      _.intersection(question.tags, Meteor.settings.interestingTags).forEach(function(argument) {

        var behaviour = {
          owner: question.owner,
          user: answer.owner,
          question: answer.question_id,
          argument: argument,
          action: 'aR'
        }

        if (question.owner == answer.owner) {
          Questioning.updateOwnerIgnorance(behaviour);
        } else {
          Questioning.updatePartecipantIgnorance(behaviour);      
        }
      });      
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

    question = Questions.findOne(options.question._id);

    _.intersection(question.tags, Meteor.settings.interestingTags).forEach(function(argument) {
      if(options.answer.owner == options.question.owner) {
        var behaviour = {
          owner: options.question.owner,
          user: options.question.owner,
          question: question._id,
          argument: argument,
          action: 'sA'
        }
        Questioning.updateOwnerIgnorance(behaviour);
      } else {
          var behaviour = {
            owner: options.question.owner,
            user: options.question.owner,
            question: options.question._id,
            argument: argument,
            action: 'aA'
          }
          Questioning.updateOwnerIgnorance(behaviour);

          var behaviour = {
            owner: options.question.owner,
            user: options.answer.owner,
            question: options.question._id,
            argument: argument,
            action: 'gA'
          }
          Questioning.updatePartecipantIgnorance(behaviour);        
      };
    });

  },

  getIgnoranceDistributionByQuestion : function(question_id) {
    var distribution = {
      createdAt: new Date().getTime(),
      question: question_id,
      ignoranceMap: {
        uu: {
          percentage: 0,
          absolute: 0
        },
        uk: {
          percentage: 0,
          absolute: 0
        },
        ku: {
          percentage: 0,
          absolute: 0
        },
        er: {
          percentage: 0,
          absolute: 0
        },
        de: {
          percentage: 0,
          absolute: 0
        },
        kk: {
          percentage: 0,
          absolute: 0
        },
      }
    }

    ku = Ignorances.find({question: question_id, classification: 'Known Unknowns'}).count();
    uk = Ignorances.find({question: question_id, classification: 'Unknown Knowns'}).count();
    er = Ignorances.find({question: question_id, classification: 'Errors'}).count();
    de = Ignorances.find({question: question_id, classification: 'Denials'}).count();
    kk = Ignorances.find({question: question_id, classification: 'Known Knowns'}).count();
    uu = Questioning.getRegisteredUsers() - ku - er - de - kk;

    total = ku + er + de + kk + uu;

    logger.debug('Total: ' + total + ' KU: ' + ku + ' UK: ' + uk + ' ER: ' + er + ' DE: ' + de + ' KK: ' + kk + ' UU: ' + uu);

    if (total != 0) {
      distribution.ignoranceMap.ku.percentage = Math.round(( 100 / total ) * ku);
      distribution.ignoranceMap.uk.percentage = Math.round(( 100 / total ) * uk);
      distribution.ignoranceMap.er.percentage = Math.round(( 100 / total ) * er);
      distribution.ignoranceMap.de.percentage = Math.round(( 100 / total ) * de);
      distribution.ignoranceMap.kk.percentage = Math.round(( 100 / total ) * kk);
      distribution.ignoranceMap.uu.percentage = 100 - distribution.ignoranceMap.ku.percentage
                                                    - distribution.ignoranceMap.uk.percentage
                                                    - distribution.ignoranceMap.er.percentage
                                                    - distribution.ignoranceMap.de.percentage
                                                    - distribution.ignoranceMap.kk.percentage;

      logger.debug( ' KU: ' + distribution.ignoranceMap.ku.percentage
       + ' UK: ' + distribution.ignoranceMap.uk.percentage 
       + ' ER: ' + distribution.ignoranceMap.er.percentage 
       + ' DE: ' + distribution.ignoranceMap.de.percentage
       + ' KK: ' + distribution.ignoranceMap.kk.percentage 
       + ' UU: ' + distribution.ignoranceMap.uu.percentage);
    }

    distribution.ignoranceMap.uu.absolute = uu;
    distribution.ignoranceMap.ku.absolute = ku;
    distribution.ignoranceMap.uk.absolute = uk;    
    distribution.ignoranceMap.er.absolute = er;
    distribution.ignoranceMap.de.absolute = de;
    distribution.ignoranceMap.kk.absolute = kk;

    return distribution;
  },

  getIgnoranceDistributionByUser : function (userId, argument) {
    if (typeof(argument)==='undefined') {
      ignorance = {
        uu: {},
        ku: {},
        uk: {},
        er: {},
        de: {},
        kk: {},      
      };
      Meteor.settings.interestingTags.forEach(function(argument) {
        ignorance[argument].userId = userId;
        ignorance[argument] = {};
        total = Questioning.getQuestionsCount(argument);
        ignorance[argument].total = total;

        items = Ignorances.find({user: userId, argument: argument});
        var score = Meteor.settings.score.initial;
        items.forEach(function (item) {
          score += item.score;
        });

        ignorance[argument].score = score;

        ignorance[argument].uu.absolute = total - Ignorances.find({user: userId, argument: argument}).count();
        ignorance[argument].ku.absolute = Ignorances.find({user: userId, argument: argument, classification : "Known Unknowns"}).count();
        ignorance[argument].uk.absolute = Ignorances.find({user: userId, argument: argument, classification : "Unknown Knowns"}).count();      
        ignorance[argument].er.absolute = Ignorances.find({user: userId, argument: argument, classification : "Errors"}).count();
        ignorance[argument].de.absolute = Ignorances.find({user: userId, argument: argument, classification : "Denials"}).count();
        ignorance[argument].kk.absolute = Ignorances.find({user: userId, argument: argument, classification : "Known Knowns"}).count();

        if (total != 0) {
          ignorance[argument].ku.percentage = Math.round((100 / total) * ignorance[argument].ku.absolute);
          ignorance[argument].uk.percentage = Math.round((100 / total) * ignorance[argument].uk.absolute);      
          ignorance[argument].er.percentage = Math.round((100 / total) * ignorance[argument].er.absolute);
          ignorance[argument].de.percentage = Math.round((100 / total) * ignorance[argument].de.absolute);
          ignorance[argument].kk.percentage = Math.round((100 / total) * ignorance[argument].kk.absolute);
          ignorance[argument].uu.percentage = 100 - ignorance[argument].ku.percentage
                                                  - ignorance[argument].uk.percentage
                                                  - ignorance[argument].er.percentage
                                                  - ignorance[argument].de.percentage
                                                  - ignorance[argument].kk.percentage;
        } else {
          ignorance[argument].ku.percentage = 0;
          ignorance[argument].uk.percentage = 0;      
          ignorance[argument].er.percentage = 0;
          ignorance[argument].de.percentage = 0;
          ignorance[argument].kk.percentage = 0;
          ignorance[argument].uu.percentage = 0;          
        }
      });

      return ignorance;    
    }

    ignorance = {};
    ignorance[argument] = {
      uu: {},
      ku: {},
      uk: {},
      er: {},
      de: {},
      kk: {},      
    };
    ignorance[argument].userId = userId;

    ignorance[argument].argument = argument;
    total = Questioning.getQuestionsCount(argument);
    ignorance[argument].total = total;

    items = Ignorances.find({user: userId, argument: argument});
    var score = Meteor.settings.score.initial;
    items.forEach(function (item) {
      score += item.score;
    });

    ignorance[argument].score = score;

    ignorance[argument].uu.absolute = total - Ignorances.find({user: userId, argument: argument}).count();
    ignorance[argument].ku.absolute = Ignorances.find({user: userId, argument: argument, classification : "Known Unknowns"}).count();
    ignorance[argument].uk.absolute = Ignorances.find({user: userId, argument: argument, classification : "Unknown Knowns"}).count();      
    ignorance[argument].er.absolute = Ignorances.find({user: userId, argument: argument, classification : "Errors"}).count();
    ignorance[argument].de.absolute = Ignorances.find({user: userId, argument: argument, classification : "Denials"}).count();
    ignorance[argument].kk.absolute = Ignorances.find({user: userId, argument: argument, classification : "Known Knowns"}).count();

    if (total != 0) {
      ignorance[argument].ku.percentage = Math.round((100 / total) * ignorance[argument].ku.absolute);
      ignorance[argument].uk.percentage = Math.round((100 / total) * ignorance[argument].uk.absolute);      
      ignorance[argument].er.percentage = Math.round((100 / total) * ignorance[argument].er.absolute);
      ignorance[argument].de.percentage = Math.round((100 / total) * ignorance[argument].de.absolute);
      ignorance[argument].kk.percentage = Math.round((100 / total) * ignorance[argument].kk.absolute);
      ignorance[argument].uu.percentage = 100 - ignorance[argument].ku.percentage
                                              - ignorance[argument].uk.percentage
                                              - ignorance[argument].er.percentage
                                              - ignorance[argument].de.percentage
                                              - ignorance[argument].kk.percentage;
    } else {
      ignorance[argument].ku.percentage = 0;
      ignorance[argument].uk.percentage = 0;      
      ignorance[argument].er.percentage = 0;
      ignorance[argument].de.percentage = 0;
      ignorance[argument].kk.percentage = 0;
      ignorance[argument].uu.percentage = 0;          
    }

    return ignorance[argument];    
  },

  getIgnoranceDistributionByArgument : function (argument) {
    totalUsers = Questioning.getRegisteredUsers();
    totalQuestions = Questioning.getQuestionsCount(argument);

    total = totalUsers * totalQuestions;

    ku = Ignorances.find({argument: argument, classification : "Known Unknowns"}).count();
    uk = Ignorances.find({argument: argument, classification : "Unknown Knowns"}).count();    
    er = Ignorances.find({argument: argument, classification : "Errors"}).count();
    de = Ignorances.find({argument: argument, classification : "Denials"}).count();
    kk = Ignorances.find({argument: argument, classification : "Known Knowns"}).count();
    uu = total - ku - er - de - kk;

    ignoranceMap = {
      uu: {
        percentage: 0,
        absolute: uu
      },
      ku: {
        percentage: 0,
        absolute: ku
      },
      uk: {
        percentage: 0,
        absolute: uk
      },      
      er: {
        percentage: 0,
        absolute: er
      },
      de: {
        percentage: 0,
        absolute: de
      },
      kk: {
        percentage: 0,
        absolute: kk
      },
    }

    if (total != 0) {
      ignoranceMap.ku.percentage = Math.round((100 / total) * ku);
      ignoranceMap.uk.percentage = Math.round((100 / total) * uk);      
      ignoranceMap.er.percentage = Math.round((100 / total) * er);
      ignoranceMap.de.percentage = Math.round((100 / total) * de);
      ignoranceMap.kk.percentage = Math.round((100 / total) * kk);
      ignoranceMap.uu.percentage = 100 - ignoranceMap.ku.percentage
                                       - ignoranceMap.uk.percentage
                                       - ignoranceMap.er.percentage
                                       - ignoranceMap.de.percentage
                                       - ignoranceMap.kk.percentage;
    }

    return ignoranceMap;
  },

  getQuestionsCount : function (tag) {
    if (typeof(tag)==='undefined') {
      return Questions.find().count();
    }

    return Questions.find({tags: tag}).count();
  },

  getRegisteredUsers : function() {
    return Meteor.users.find().count();
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
