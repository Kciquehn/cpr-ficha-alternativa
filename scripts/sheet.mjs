const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;
const ESSENTIALS_TEMPLATE = "modules/cpr-ficha-alternativa/templates/essentials.hbs";

class CPRFichaAlternativa extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cpr-ficha-alternativa"],
    position: { width: 960, height: 620 },
    window: { resizable: true },
    form: { submitOnChange: true },
  };

  static PARTS = {
    layout: {
      template: "modules/cpr-ficha-alternativa/templates/sheet.hbs",
      templates: [ESSENTIALS_TEMPLATE],
      scrollable: [".cpr-alt-essentials"],
    },
  };

  static TABS = {
    sheet: {
      initial: "lifepath",
      tabs: [
        { id: "lifepath", label: "História" },
        { id: "stats", label: "Atributos e Perícias" },
        { id: "gear", label: "Equipamento" },
        { id: "ability", label: "Habilidade de Cargo" },
      ],
    },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.actor;
    const { system } = actor;
    const canSeeDetails = actor.testUserPermission(game.user, "OBSERVER");
    Object.assign(context, { actor, system, canSeeDetails });
    context.tabs = this._prepareTabs("sheet");

    if (canSeeDetails) {
      const { i18n } = game;
      const format = new Intl.NumberFormat(i18n.lang);
      context.stats = Object.entries(system.stats).map(([id, stat]) => ({
        label: i18n.localize(`CPR.global.stats.${id}`),
        field: `system.stats.${id}.value`,
        value: stat.value,
        max: stat.max,
        hasMax: typeof stat.max === "number",
      }));
      const woundState = system.derivedStats.currentWoundState;
      context.woundState = woundState ? i18n.localize(`CPR.global.woundState.${woundState}`) : "—";
      context.improvementPoints = format.format(system.improvementPoints.value);
      context.wealth = format.format(system.wealth.value);
    }

    return context;
  }

  _toggleDisabled(disabled) {
    super._toggleDisabled(disabled);
    if (disabled && !this.isEditable) {
      for (const button of this.element.querySelectorAll(".cpr-alt-tabs button")) {
        button.disabled = false;
      }
    }
  }

  _onChangeForm(formConfig, event) {
    if (event.target instanceof HTMLInputElement && !event.target.reportValidity()) return;
    return super._onChangeForm(formConfig, event);
  }

  _processFormData(event, _form, formData) {
    const data = formData.object;
    // A edição de imagem do Foundry dispara submit. Os outros campos salvam no change.
    if (event?.type !== "change") {
      return data.img && data.img !== this.actor.img ? { img: data.img } : {};
    }

    const field = event.target.name;
    if (!Object.hasOwn(data, field)) return {};
    return foundry.utils.expandObject({ [field]: data[field] });
  }
}

Hooks.once("init", () => {
  foundry.documents.collections.Actors.registerSheet(
    "cpr-ficha-alternativa",
    CPRFichaAlternativa,
    {
      label: "Cyberpunk RED - Ficha Alternativa",
      types: ["character"],
      makeDefault: false,
    },
  );
});
