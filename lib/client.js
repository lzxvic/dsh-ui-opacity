window.__ModuleLoader__.load({
  id: "dsh-menu-opacity",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    const React = require("react");

    const STORAGE_KEY = "dsh-menu-opacity";
    const DEFAULT = 96;
    const MIN = 40;
    const MAX = 100;

    function readStored() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const value = Number(raw);
        if (Number.isFinite(value) && value >= MIN && value <= MAX) return value;
      } catch (error) {}
      return DEFAULT;
    }

    function store(value) {
      try {
        window.localStorage.setItem(STORAGE_KEY, String(value));
      } catch (error) {}
    }

    function applyAlpha(value) {
      const alpha = Math.min(MAX, Math.max(MIN, Number(value))) / 100;
      document.documentElement.style.setProperty("--dsh-menu-alpha", String(alpha));
    }

    /*
     * The product ships its menu material at 58% (light) / 45% (dark), which
     * lets the conversation text show through the composer "+" menu. Override
     * only the fill of the menu material; the glass edges, radius and shadow
     * stay as the theme/product draw them. The selectors are deliberately more
     * specific than the product's :root and body[data-ds-dark-theme] rules so a
     * theme cannot win by injection order.
     */
    const CSS = `
html:root { --dsw-menu-surface-fill: rgb(248 249 250 / var(--dsh-menu-alpha, .96)) !important; }
html body[data-ds-dark-theme],
html body[data-dshome-dark] { --dsw-menu-surface-fill: rgb(39 50 76 / var(--dsh-menu-alpha, .96)) !important; }
`;

    function ensureStyle() {
      let style = document.querySelector("style[data-dsh-menu-opacity]");
      if (style === null) {
        style = document.createElement("style");
        style.dataset.dshMenuOpacity = "";
        style.textContent = CSS;
        document.head.appendChild(style);
      }
      applyAlpha(readStored());
    }

    function MenuOpacitySection() {
      const [value, setValue] = React.useState(readStored);

      React.useEffect(() => {
        applyAlpha(value);
      }, [value]);

      const update = (next) => {
        const clamped = Math.min(MAX, Math.max(MIN, Number(next)));
        setValue(clamped);
        store(clamped);
        applyAlpha(clamped);
      };

      const reset = () => update(DEFAULT);

      return React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 12, padding: "4px 0", maxWidth: 560 } },
        React.createElement(
          "h3",
          { style: { margin: 0, fontSize: 16, fontWeight: 500, lineHeight: "24px" } },
          "菜单不透明度"
        ),
        React.createElement(
          "p",
          { style: { margin: 0, fontSize: 13, lineHeight: "20px", color: "var(--dsw-alias-label-secondary)" } },
          "调整加号菜单、模型选择、权限等浮层菜单的背景不透明度。数值越高越不透明；玻璃边缘和阴影保持原样。"
        ),
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 12 } },
          React.createElement("input", {
            type: "range",
            min: MIN,
            max: MAX,
            step: 1,
            value,
            "aria-label": "菜单不透明度",
            onChange: (event) => update(event.target.value),
            style: { flex: 1, accentColor: "var(--ds-brand, #059669)" }
          }),
          React.createElement(
            "span",
            {
              style: {
                minWidth: 48,
                textAlign: "right",
                fontSize: 13,
                fontVariantNumeric: "tabular-nums",
                color: "var(--dsw-alias-label-primary)"
              }
            },
            `${value}%`
          )
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          React.createElement(
            "button",
            {
              type: "button",
              onClick: reset,
              style: {
                height: 28,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid var(--dsw-alias-border-l2)",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
                font: "inherit",
                fontSize: 12
              }
            },
            `恢复默认（${DEFAULT}%）`
          )
        )
      );
    }

    function apply(ctx) {
      ensureStyle();
      const slots = ctx.get("slots");
      if (slots === undefined) return;
      slots.inject("settings.section", () =>
        slots.register(
          {
            name: "settings.section",
            id: "menu-opacity",
            order: 101,
            label: () => "菜单不透明度",
            inject: () => ({})
          },
          MenuOpacitySection
        )
      );
    }

    exports.apply = apply;
    exports.inject = ["slots"];
    return module.exports;
  }
});
