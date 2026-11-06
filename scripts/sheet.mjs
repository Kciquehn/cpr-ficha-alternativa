import CPRCharacterActorSheet from "../../../systems/cyberpunk-red-core/modules/actor/sheet/cpr-character-sheet.js";

const CHARACTER_TEMPLATES = "systems/cyberpunk-red-core/templates/actor/character";

// Endpoints in the skeleton image's original pixel coordinates.
const CYBER_ARROW_TARGETS = {
  cyberAudioSuite: [577, 130],
  cyberEye: [695, 126],
  cyberArm: [442, 379],
  cyberLeg: [547, 1341],
  neuralWare: [643, 278],
  cyberwareInternal: [644, 530],
};

const INVENTORY_CATEGORIES = [
  { id: "ammo", label: "Munição", types: ["ammo"] },
  { id: "armor", label: "Armaduras", types: ["armor"] },
  { id: "clothing", label: "Roupas", types: ["clothing"] },
  { id: "cyberware", label: "Cibernética", types: ["cyberware"] },
  { id: "gear", label: "Equipamentos", types: ["gear", "drug", "itemUpgrade", "cyberdeck", "netarch"] },
  { id: "program", label: "Programas", types: ["program"] },
  { id: "vehicle", label: "Veículos", types: ["vehicle"] },
  { id: "weapon", label: "Armas", types: ["weapon"] },
];

function normalizeSkillSearch(text) {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ");
}

class CPRFichaAlternativa extends CPRCharacterActorSheet {
  #skillQuery = "";
  #skillOptions = { dense: false, grouped: false, hideZero: false };
  #inventoryCategory = "ammo";
  #cyberwareRegion = "all";
  #cyberArrowObserver;

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
        "modules/cpr-ficha-alternativa/templates/cyberware-map.hbs",
        `${CHARACTER_TEMPLATES}/right-pane/tabs/cyberware/cpr-cyberware-content.hbs`,
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
    const { cyberdeck, program } = this.actor.itemTypes;
    const showPrograms = cyberdeck?.length || program?.length;
    context.altInventoryCategories = INVENTORY_CATEGORIES.filter(({ id }) => id !== "program" || showPrograms);
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
    this.#bindSkillOptions();
    this.#bindInventoryCategories(context.altInventoryCategories);
    this.#bindCyberwareMap();
  }

  #bindCyberwareMap() {
    this.#cyberArrowObserver?.disconnect();
    const map = this.element.querySelector(".cpr-alt-cyberware-map");
    if (!map) return;

    const buttons = map.querySelectorAll("[data-cyber-region]");
    const panels = map.querySelectorAll("[data-cyber-panel]");
    for (const button of buttons) {
      const panel = Array.from(panels).find(panel => panel.dataset.cyberPanel === button.dataset.cyberRegion);
      const count = panel?.querySelectorAll("li.item[data-item-id]").length;
      if (count) {
        button.querySelector(".cpr-alt-cyber-count").textContent = count;
        button.classList.add("has-implants");
      }
    }

    const show = () => {
      for (const button of buttons) {
        button.setAttribute("aria-pressed", String(button.dataset.cyberRegion === this.#cyberwareRegion));
      }
      for (const panel of panels) {
        panel.hidden = this.#cyberwareRegion !== "all" && panel.dataset.cyberPanel !== this.#cyberwareRegion;
      }
    };
    map.addEventListener("click", event => {
      const button = event.target.closest("[data-cyber-region]");
      if (!button) return;
      this.#cyberwareRegion = button.dataset.cyberRegion;
      show();
    });
    show();
    this.#bindCyberArrows(map);
  }

  #bindCyberArrows(map) {
    const layer = map.querySelector(".cpr-alt-cyber-arrows");
    const skeleton = map.querySelector(".cpr-alt-cyber-body img");
    const imageWidth = Number(skeleton.getAttribute("width"));
    const imageHeight = Number(skeleton.getAttribute("height"));
    const connections = Object.entries(CYBER_ARROW_TARGETS).map(([region, point]) => ({
      button: map.querySelector(`[data-cyber-region="${region}"]`),
      point,
      line: document.createElementNS("http://www.w3.org/2000/svg", "polyline"),
      arrow: document.createElementNS("http://www.w3.org/2000/svg", "polygon"),
    })).filter(({ button }) => button);
    layer.replaceChildren(...connections.flatMap(({ line, arrow }) => [line, arrow]));

    const draw = () => {
      const frame = layer.getBoundingClientRect();
      const image = skeleton.getBoundingClientRect();
      if (!frame.width || !image.height) return;
      for (const { button, point: [x, y], line, arrow } of connections) {
        const box = button.getBoundingClientRect();
        const fromLeft = box.right <= image.left;
        const startX = (fromLeft ? box.right + 2 : box.left - 2) - frame.left;
        const startY = box.top + box.height / 2 - frame.top;
        const tipX = image.left - frame.left + image.width * x / imageWidth;
        const tipY = image.top - frame.top + image.height * y / imageHeight;
        const region = button.dataset.cyberRegion;
        const elbowX = (startX + tipX) / 2;
        let points = [[startX, startY], [elbowX, startY], [elbowX, tipY], [tipX, tipY]];
        if (region === "cyberAudioSuite") {
          const audioX = box.left - frame.left + box.width * 0.26;
          points = [[audioX, box.bottom - frame.top], [audioX, tipY], [tipX, tipY]];
        }
        const [beforeX, beforeY] = points.at(-2);
        const angle = Math.atan2(tipY - beforeY, tipX - beforeX) * 180 / Math.PI;
        line.setAttribute("points", points.map(pair => pair.join(",")).join(" "));
        arrow.setAttribute("points", "0,0 -10,-5 -10,5");
        arrow.setAttribute("transform", `translate(${tipX} ${tipY}) rotate(${angle})`);
      }
    };

    this.#cyberArrowObserver = new ResizeObserver(draw);
    for (const element of [layer, skeleton, ...connections.map(({ button }) => button)]) {
      this.#cyberArrowObserver.observe(element);
    }
    draw();
  }

  _onClose(options) {
    this.#cyberArrowObserver?.disconnect();
    super._onClose(options);
  }

  #bindSkillOptions() {
    const search = this.element.querySelector(".cpr-alt-skill-search input");
    if (!search) return;

    const container = this.element.querySelector(".skills-container");
    const empty = this.element.querySelector(".cpr-alt-skill-empty");
    const controls = this.element.querySelectorAll(".cpr-alt-skill-options input");
    const collator = new Intl.Collator(game.i18n.lang, { sensitivity: "base", numeric: true });
    const groups = Array.from(container.querySelectorAll(":scope > .items-list > .collapsible"), group => {
      const list = group.querySelector(":scope > ol");
      const skills = Array.from(list.querySelectorAll("li[data-skill-category]"), row => {
        const roll = row.querySelector("a[data-roll-type='skill']");
        const name = roll.textContent.trim();
        const base = row.querySelector(".skill-base").textContent.trim();
        roll.dataset.cprAltSkillBase = /^[+-]/.test(base) ? base : `+${base}`;
        row.querySelector(".skill-input")?.setAttribute("aria-label", `Nível de ${name}`);
        return { row, name, searchName: normalizeSkillSearch(name), itemName: roll.dataset.rollTitle };
      });
      return { group, list, skills };
    });
    const alphabetical = groups.flatMap(({ skills }) => skills).sort((a, b) => collator.compare(a.name, b.name));
    const flatList = document.createElement("ol");
    flatList.className = "items-list cpr-alt-flat-skills";
    container.append(flatList);

    const arrange = () => {
      const { grouped } = this.#skillOptions;
      container.classList.toggle("cpr-alt-skills-flat", !grouped);
      flatList.hidden = grouped;
      if (grouped) {
        for (const { list, skills } of groups) list.append(...skills.map(({ row }) => row));
      } else {
        flatList.append(...alphabetical.map(({ row }) => row));
      }
    };

    const filter = () => {
      this.#skillQuery = search.value;
      const query = normalizeSkillSearch(search.value.trim());
      const { hideZero, grouped } = this.#skillOptions;
      let matches = 0;

      for (const { group, skills } of groups) {
        let groupMatches = 0;
        for (const { row, searchName, itemName } of skills) {
          const match = (!query || searchName.includes(query)) && (!hideZero || this.actor.getSkillLevel(itemName) !== 0);
          if (!match) row.dataset.cprAltSkillFilter = "hide";
          else if (query) row.dataset.cprAltSkillFilter = "match";
          else delete row.dataset.cprAltSkillFilter;
          if (match) groupMatches += 1;
        }

        group.hidden = grouped && Boolean(query || hideZero) && !groupMatches;
        matches += groupMatches;
      }
      empty.hidden = (!query && !hideZero) || matches > 0;
    };

    search.value = this.#skillQuery;
    for (const control of controls) {
      const option = control.dataset.skillOption;
      control.checked = this.#skillOptions[option];
      control.addEventListener("change", (event) => {
        event.stopPropagation();
        this.#skillOptions[option] = control.checked;
        if (option === "grouped") arrange();
        if (option === "dense") container.classList.toggle("cpr-alt-skills-dense", control.checked);
        filter();
      });
    }

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
    container.classList.toggle("cpr-alt-skills-dense", this.#skillOptions.dense);
    arrange();
    filter();
  }

  #bindInventoryCategories(categories) {
    const nav = this.element.querySelector(".cpr-alt-inventory-tabs");
    if (!nav) return;

    const buttons = Array.from(nav.querySelectorAll("button[data-inventory-category]"));
    const groups = this.element.querySelectorAll(".gear-tab-data > .items-list > .collapsible");
    const empty = this.element.querySelector(".cpr-alt-inventory-empty");
    const categoryByType = new Map(categories.flatMap(({ id, types }) => types.map(type => [type, id])));
    const groupData = Array.from(groups, group => {
      const type = group.querySelector("[id^='gearTab-']")?.id.slice("gearTab-".length);
      return {
        group,
        category: categoryByType.get(type) ?? "gear",
        hasItems: Boolean(group.querySelector("[data-item-id]")),
        canCreate: this.isEditable && Boolean(group.querySelector(".item-create")),
      };
    });

    const select = (category) => {
      this.#inventoryCategory = category;
      for (const button of buttons) {
        const active = button.dataset.inventoryCategory === category;
        button.classList.toggle("active", active);
        button.ariaPressed = String(active);
      }

      let hasItems = false;
      for (const entry of groupData) {
        const selected = entry.category === category;
        entry.group.hidden = !selected || (!entry.hasItems && !entry.canCreate);
        if (selected && entry.hasItems) hasItems = true;
      }
      empty.hidden = hasItems;
    };

    select(buttons.some(button => button.dataset.inventoryCategory === this.#inventoryCategory)
      ? this.#inventoryCategory
      : buttons[0].dataset.inventoryCategory);
    for (const button of buttons) {
      button.addEventListener("click", () => select(button.dataset.inventoryCategory));
    }
  }

  _toggleDisabled(disabled) {
    super._toggleDisabled(disabled);
    if (disabled && !this.isEditable) {
      const selector = ".cpr-alt-tabs button, .cpr-alt-skill-search input, .cpr-alt-skill-options input, .cpr-alt-inventory-tabs button";
      for (const control of this.element.querySelectorAll(selector)) {
        control.disabled = false;
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
  if (game.system.id !== "cyberpunk-red-core") return;
  document.documentElement.classList.add("cpr-alt-world-theme");
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
