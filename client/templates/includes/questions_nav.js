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
Template.questionsNav.helpers({
  activeIfTemplateIs: function (template) {
    var currentRoute = Router.current();
    return currentRoute &&
      template === currentRoute.lookupTemplate() ? 'active' : '';
  }
});