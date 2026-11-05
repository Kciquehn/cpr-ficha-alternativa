import CPRCharacterActorSheet from "../../../systems/cyberpunk-red-core/modules/actor/sheet/cpr-character-sheet.js";

const CHARACTER_TEMPLATES = "systems/cyberpunk-red-core/templates/actor/character";

function normalizeSkillSearch(text) {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ");
}

class CPRFichaAlternativa extends CPRCharacterActorSheet {
  #skillQuery = "";

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
    this.#bindSkillSearch();
  }

  #bindSkillSearch() {
    const search = this.element.querySelector(".cpr-alt-skill-search input");
    if (!search) return;

    const empty = this.element.querySelector(".cpr-alt-skill-empty");
    const groups = this.element.querySelectorAll(".skills-container > .items-list > .collapsible");
    search.value = this.#skillQuery;

    const filter = () => {
      this.#skillQuery = search.value;
      const query = normalizeSkillSearch(search.value.trim());
      let matches = 0;

      for (const group of groups) {
        let groupMatches = 0;
        for (const row of group.querySelectorAll("li[data-skill-category]")) {
          if (!query) {
            delete row.dataset.cprAltSkillFilter;
            continue;
          }

          const name = row.querySelector("a[data-roll-type='skill']")?.textContent ?? "";
          const match = normalizeSkillSearch(name).includes(query);
          row.dataset.cprAltSkillFilter = match ? "match" : "hide";
          if (match) groupMatches += 1;
        }

        if (query && !groupMatches) group.dataset.cprAltSkillFilter = "hide";
        else delete group.dataset.cprAltSkillFilter;
        matches += groupMatches;
      }

      empty.hidden = !query || matches > 0;
    };

    search.addEventListener("input", filter);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Enter") event.preventDefault();
      if (event.key === "Escape" && search.value) {
        event.preventDefault();
        event.stopPropagation();
        search.value = "";
        filter();
      }
    });
    filter();
  }

  _toggleDisabled(disabled) {
    super._toggleDisabled(disabled);
    if (disabled && !this.isEditable) {
      for (const button of this.element.querySelectorAll(".cpr-alt-tabs button, .cpr-alt-skill-search input")) {
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
