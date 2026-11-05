import CPRCharacterActorSheet from "../../../systems/cyberpunk-red-core/modules/actor/sheet/cpr-character-sheet.js";

class CPRFichaAlternativa extends CPRCharacterActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["cpr-ficha-alternativa"],
    position: { width: 1120 },
  };

  _onRender(context, options) {
    super._onRender(context, options);

    const healthPanel = this.element.querySelector(".actor-details-hp");
    if (!healthPanel) return;

    const { value, max } = this.actor.system.derivedStats.hp;
    const ratio = max > 0 ? value / max : 0;
    const percent = Math.min(100, Math.max(0, ratio * 100));

    healthPanel.style.setProperty("--cpr-alt-hp-percent", `${percent}%`);
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
