import CPRCharacterActorSheet from "../../../systems/cyberpunk-red-core/modules/actor/sheet/cpr-character-sheet.js";

const CHARACTER_TEMPLATES = "systems/cyberpunk-red-core/templates/actor/character";

class CPRFichaAlternativa extends CPRCharacterActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["cpr-ficha-alternativa"],
    position: { width: 1100, height: 740 },
  };

  static PARTS = {
    form: {
      template: "modules/cpr-ficha-alternativa/templates/sheet.hbs",
      templates: [
        "modules/cpr-ficha-alternativa/templates/essentials.hbs",
        `${CHARACTER_TEMPLATES}/left-pane/cpr-left-pane-info.hbs`,
        `${CHARACTER_TEMPLATES}/left-pane/cpr-left-pane-stats.hbs`,
        `${CHARACTER_TEMPLATES}/right-pane/cpr-skills.hbs`,
        `${CHARACTER_TEMPLATES}/right-pane/cpr-gear.hbs`,
        `${CHARACTER_TEMPLATES}/right-pane/cpr-cyberware.hbs`,
        `${CHARACTER_TEMPLATES}/right-pane/cpr-effects.hbs`,
        `${CHARACTER_TEMPLATES}/bottom-pane/cpr-role-tab.hbs`,
        `${CHARACTER_TEMPLATES}/bottom-pane/cpr-fight-tab.hbs`,
        `${CHARACTER_TEMPLATES}/bottom-pane/cpr-lifepath-tab.hbs`,
      ],
      scrollable: [".cpr-alt-essentials", ".right-content-section"],
    },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.altCanSeeDetails = this.actor.testUserPermission(game.user, "OBSERVER");
    const { hp } = this.actor.system.derivedStats;
    context.altHpPercent = hp.max > 0 ? Math.max(0, Math.min(100, 100 * hp.value / hp.max)) : 0;
    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const nav = this.element.querySelector(".cpr-alt-tabs");
    if (!nav) return;

    const sync = () => {
      for (const button of nav.querySelectorAll("button")) {
        button.ariaPressed = String(button.classList.contains("active"));
      }
    };
    sync();
    nav.addEventListener("click", sync);
  }

  _toggleDisabled(disabled) {
    super._toggleDisabled(disabled);
    if (disabled && !this.isEditable) {
      for (const button of this.element.querySelectorAll(".cpr-alt-tabs button")) {
        button.disabled = false;
      }
    }
  }

  _processFormData(event, _form, formData) {
    const data = formData.object;
    // O seletor nativo de retrato dispara submit. Os campos do ator usam change.
    if (event?.type !== "change") {
      return data.img && data.img !== this.actor.img ? { img: data.img } : {};
    }

    const field = event.target.name;
    // Quantidades e outros controles de itens são tratados pelos eventos da ficha oficial.
    if (!field || !Object.hasOwn(data, field) || (field !== "name" && !field.startsWith("system."))) {
      return {};
    }
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
