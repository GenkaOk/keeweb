const Backbone = require('backbone');
const Scrollable = require('../mixins/scrollable');
const Locale = require('../util/locale');
const GeneratorPresets = require('../comp/generator-presets');
const PasswordGenerator = require('../util/password-generator');

const GeneratorPresetsView = Backbone.View.extend({
    template: require('templates/generator-presets.hbs'),

    events: {
        'click .back-button': 'returnToApp',
        'change .gen-ps__list': 'changePreset',
        'click .gen-ps__btn-create': 'createPreset',
        'click .gen-ps__btn-delete': 'deletePreset',
        'input #gen-ps__field-title': 'changeTitle',
        'change #gen-ps__check-enabled': 'changeEnabled',
        'change #gen-ps__check-default': 'changeDefault',
        'input #gen-ps__field-length': 'changeLength',
        'change .gen-ps__check-range': 'changeRange',
        'input #gen-ps__field-include': 'changeInclude'
    },

    selected: null,

    reservedTitles: [Locale.genPresetDerived],

    initialize() {
        this.appModel = this.model;
    },

    render() {
        this.presets = GeneratorPresets.all;
        if (!this.selected || !this.presets.some(p => p.name === this.selected)) {
            this.selected = (this.presets.filter(p => p.default)[0] || this.presets[0]).name;
        }
        this.renderTemplate(
            {
                presets: this.presets,
                selected: this.getPreset(this.selected),
                ranges: this.getSelectedRanges()
            },
            true
        );
        this.createScroll({
            root: this.$el.find('.gen-ps')[0],
            scroller: this.$el.find('.scroller')[0],
            bar: this.$el.find('.scroller__bar')[0]
        });
        this.renderExample();
        return this;
    },

    renderExample() {
        const selectedPreset = this.getPreset(this.selected);
        const example = PasswordGenerator.generate(selectedPreset);
        this.$el.find('.gen-ps__example').text(example);
        this.pageResized();
    },

    getSelectedRanges() {
        const sel = this.getPreset(this.selected);
        const rangeOverride = {
            high: '¡¢£¤¥¦§©ª«¬®¯°±¹²´µ¶»¼÷¿ÀÖîü...'
        };
        return ['Upper', 'Lower', 'Digits', 'Special', 'Brackets', 'High', 'Ambiguous'].map(
            name => {
                const nameLower = name.toLowerCase();
                return {
                    name: nameLower,
                    title: Locale['genPs' + name],
                    enabled: sel[nameLower],
                    sample: rangeOverride[nameLower] || PasswordGenerator.charRanges[nameLower]
                };
            }
        );
    },

    getPreset(name) {
        return this.presets.filter(p => p.name === name)[0];
    },

    returnToApp() {
        Backbone.trigger('edit-generator-presets');
    },

    changePreset(e) {
        this.selected = e.target.value;
        this.render();
    },

    createPreset() {
        let name;
        let title;
        for (let i = 1; ; i++) {
            const newName = 'Custom' + i;
            const newTitle = Locale.genPsNew + ' ' + i;
            if (!this.presets.filter(p => p.name === newName || p.title === newTitle).length) {
                name = newName;
                title = newTitle;
                break;
            }
        }
        const selected = this.getPreset(this.selected);
        const preset = {
            name,
            title,
            length: selected.length,
            upper: selected.upper,
            lower: selected.lower,
            digits: selected.digits,
            special: selected.special,
            brackets: selected.brackets,
            ambiguous: selected.ambiguous,
            include: selected.include
        };
        GeneratorPresets.add(preset);
        this.selected = name;
        this.render();
    },

    deletePreset() {
        GeneratorPresets.remove(this.selected);
        this.render();
    },

    changeTitle(e) {
        const title = $.trim(e.target.value);
        if (title && title !== this.getPreset(this.selected).title) {
            let duplicate = this.presets.some(p => p.title.toLowerCase() === title.toLowerCase());
            if (!duplicate) {
                duplicate = this.reservedTitles.some(p => p.toLowerCase() === title.toLowerCase());
            }
            if (duplicate) {
                $(e.target).addClass('input--error');
                return;
            } else {
                $(e.target).removeClass('input--error');
            }
            GeneratorPresets.setPreset(this.selected, { title });
            this.$el.find('.gen-ps__list option[selected]').text(title);
        }
    },

    changeEnabled(e) {
        const enabled = e.target.checked;
        GeneratorPresets.setDisabled(this.selected, !enabled);
    },

    changeDefault(e) {
        const isDefault = e.target.checked;
        GeneratorPresets.setDefault(isDefault ? this.selected : null);
    },

    changeLength(e) {
        const length = +e.target.value;
        if (length > 0) {
            GeneratorPresets.setPreset(this.selected, { length });
            $(e.target).removeClass('input--error');
        } else {
            $(e.target).addClass('input--error');
        }
        this.presets = GeneratorPresets.all;
        this.renderExample();
    },

    changeRange(e) {
        const enabled = e.target.checked;
        const range = e.target.dataset.range;
        GeneratorPresets.setPreset(this.selected, { [range]: enabled });
        this.presets = GeneratorPresets.all;
        this.renderExample();
    },

    changeInclude(e) {
        const include = e.target.value;
        if (include !== this.getPreset(this.selected).include) {
            GeneratorPresets.setPreset(this.selected, { include });
        }
        this.presets = GeneratorPresets.all;
        this.renderExample();
    }
});

_.extend(GeneratorPresetsView.prototype, Scrollable);

module.exports = GeneratorPresetsView;
