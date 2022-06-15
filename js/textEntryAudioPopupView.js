import Adapt from 'core/js/adapt';

class TextEntryAudioPopupView extends Backbone.View {

  className() {
      return 'textEntry-audio-popup-content';
    }

  events() {
    return {
      'click .textEntry-close-button': 'closePopup'
    };
  }

  initialize(...args) {
    super.initialize(...args);

    this.listenToOnce(Adapt, 'notify:opened', this.onOpened);
    this.render();
  }

  onOpened() {
    this.playAudio();
  }

  render() {
    const data = this.model.toJSON();
    data.view = this;
    const template = Handlebars.templates[this.constructor.template];
    this.$el.html(template(data));
  }

  closePopup(event) {
    Adapt.trigger('notify:close');
  }

  playAudio() {
    if (Adapt.audio && this.model.has('_audio') && this.model.get('_audio')._isEnabled && Adapt.audio.audioClip[this.model.get('_audio')._channel].status==1) {
      Adapt.audio.audioClip[this.model.get('_audio')._channel].onscreenID = "";
      Adapt.trigger('audio:playAudio', this.model.get("_feedback")._audio.src, this.model.get('_id'), this.model.get('_audio')._channel);
    }
  }
}

TextEntryAudioPopupView.template = 'textEntryAudioPopup';

export default TextEntryAudioPopupView;
