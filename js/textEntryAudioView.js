import Adapt from 'core/js/adapt';
import ComponentView from 'core/js/views/componentView';
import TextEntryAudioPopupView from './textEntryAudioPopupView';

class TextEntryAudioView extends ComponentView {

  events() {
    return {
      'click .js-btn-action': 'onBtnClicked',
      'click .js-btn-feedback': 'openPopup',
      'keyup .textEntry-audio-item-textbox': 'onInputChanged'
    };
  }

  initialize(...args) {
    super.initialize(...args);

    this.setUpViewData();
    this.setUpEventListeners();
  }

  setUpViewData() {
    this.popupView = null;
    this._isPopupOpen = false;
  }

  setUpEventListeners() {
    this.listenTo(Adapt.config, 'change:_activeLanguage', this.resetUserAnswers);
  }

  postRender() {
    this.restoreUserAnswers();
    this.setReadyStatus();

    if (this.model.get('_setCompletionOn') === 'inview') {
      this.setupInviewCompletion();
    }

    this.updateCounter();
  }

  onBtnClicked(event) {
    if (event) event.preventDefault();

    if (this.model.get('_isSubmitted')) return;

    if (this.$('.textEntry-audio-item-textbox').val() == "") return;

    this.userAnswer = this.$('.textEntry-audio-item-textbox').val();
    this.model.set("userAnswer", this.userAnswer);

    this.initFeedback();

    this.model.set('_isSubmitted', true);

    this.$('.btn__action').addClass('is-disabled').attr('disabled', true);

    this.$('.textEntry-audio-item-textbox').attr('disabled', true);

    Adapt.offlineStorage.set(this.model.get('_id'), this.model.get("userAnswer"));

    if (!this.model.get('_recordInteraction')) return;
    Adapt.trigger('questionView:recordInteraction', this);
  }

  initFeedback() {
    if (this.model.get('_canShowFeedback')) {
      this.$('.btn__feedback').removeClass('is-disabled').attr('disabled', false);
      this.openPopup();
    } else {
      this.setCompletionStatus();
    }
  }

  openPopup() {
    if (this._isPopupOpen) return;

    this._isPopupOpen = true;

    Adapt.trigger('audio:stopAllChannels');

    this.popupView = new TextEntryAudioPopupView({
      model: this.model
    });

    Adapt.notify.popup({
      _view: this.popupView,
      _isCancellable: true,
      _showCloseButton: false,
      _closeOnBackdrop: true,
      _classes: 'textEntry-audio-popup'
    });

    this.listenToOnce(Adapt, {
      'popup:closed': this.onPopupClosed
    });
  }

  onPopupClosed() {
    this._isPopupOpen = false;
    this.setCompletionStatus();
  }

  restoreUserAnswers() {
    const storedAnswer = Adapt.offlineStorage.get(this.model.get('_id'));

    if (!storedAnswer) return;

    this.setCompletionStatus();

    this.model.set('userAnswer', storedAnswer);
    this.model.set('_isSubmitted', true);

    this.$('.textEntry-audio-item-textbox').val(this.model.get('userAnswer')).attr('disabled', true);

    this.$('.btn__action').addClass('is-disabled').attr('disabled', true);

    if (this.model.get('_canShowFeedback')) {
      this.$('.btn__feedback').attr('disabled', false).removeClass('is-disabled');
    }

    this.updateCounter();
  }

  resetUserAnswers() {
    this.model.set('userAnswer', '');

    this.$('.textEntry-audio-item-textbox').val('');

    this.model.set('_isSubmitted', false);

    this.$('.btn__action').addClass('is-disabled');

    this.$('.textEntry-audio-item-textbox').attr('disabled', false);

    if (this.model.get('_canShowFeedback')) {
      this.$('.btn__feedback').attr('disabled', true).addClass('is-disabled');
    }

    this.updateCounter();

    this.model.reset(true);

    Adapt.offlineStorage.set(this.model.get('_id'), this.model.get("userAnswer"));
  }

  onInputChanged(event) {
    if (event) event.preventDefault();

    this.$('.btn__action').removeClass('is-disabled');

    this.updateCounter();
  }

  updateCounter() {
    if (!this.model.get('_characterLimit')) return;
    if (!this.model.get('_characterLimit')._isEnabled) return;

    const length = this.$('.textEntry-audio-item-textbox').val().length;
    const max = this.model.get('_characterLimit')._max;
    const text = this.model.get('_characterLimit').text;
    const output = text+" "+(max - length);

    this.$('.textEntry-audio-counter').html(output);
  }

  isCorrect() {
    return null;
  }

  // Time elapsed between the time the interaction was made available to the learner for response and the time of the first response
  getLatency() {
    return null;
  }

  /**
  * used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
  * returns the user's answers as a string in the format 'answer1[,]answer2[,]answer3'
  * the use of [,] as an answer delimiter is from the SCORM 2004 specification for the fill-in interaction type
  */
  getResponse() {
    return this.model.get('userAnswer');
  }

  /**
  * used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
  */
  getResponseType() {
    return 'fill-in';
  }
}

TextEntryAudioView.template = 'textEntry-audio';

export default TextEntryAudioView;
