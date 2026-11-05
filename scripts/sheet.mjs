const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

class CPRFichaAlternativa extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cpr-ficha-alternativa"],
    position: { width: 720, height: 460 },
    window: { resizable: true },
  };

  static PARTS = {
    layout: { template: "modules/cpr-ficha-alternativa/templates/sheet.hbs" },
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
    context.tabs = this._prepareTabs("sheet");
    return context;
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
