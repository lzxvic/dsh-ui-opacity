window.__ModuleLoader__.load({
  id: "dsh-menu-opacity",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    const React = require("react");

    const MENU_KEY = "dsh-menu-opacity";
    const HEADER_KEY = "dsh-header-opacity";
    const MENU_DEFAULT = 96;
    const MENU_MIN = 40;
    const MENU_MAX = 100;
    const HEADER_DEFAULT = 0;
    const HEADER_MIN = 0;
    const HEADER_MAX = 100;
    /* Hover keeps at least the theme's own 45% glass, even when the resting
       header is left transparent. */
    const HEADER_HOVER_FLOOR = 0.45;

    function readNumber(key, fallback, min, max) {
      try {
        const raw = window.localStorage.getItem(key);
        const value = Number(raw);
        if (Number.isFinite(value) && value >= min && value <= max) return value;
      } catch (error) {}
      return fallback;
    }

    function writeNumber(key, value) {
      try {
        window.localStorage.setItem(key, String(value));
      } catch (error) {}
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, Number(value)));
    }

    function applyMenuAlpha(value) {
      const alpha = clamp(value, MENU_MIN, MENU_MAX) / 100;
      document.documentElement.style.setProperty("--dsh-menu-alpha", String(alpha));
    }

    function applyHeaderAlpha(value) {
      const percent = clamp(value, HEADER_MIN, HEADER_MAX);
      const alpha = percent / 100;
      const hover = Math.max(alpha, HEADER_HOVER_FLOOR);
      document.documentElement.style.setProperty("--dsh-header-alpha", String(alpha));
      document.documentElement.style.setProperty("--dsh-header-hover-alpha", String(hover));
    }

    /*
     * Two independent surfaces:
     *
     * 1. Popup menus — product material is 58% (light) / 45% (dark), so chat
     *    text bleeds through the composer "+" menu. We override only the fill.
     * 2. Session header — the theme paints a floating capsule that is fully
     *    transparent at rest and 45% + blur on hover. We keep that behaviour at
     *    0% and let the user raise the resting fill; hover never goes below the
     *    theme's 45% glass.
     *
     * Selectors are deliberately more specific than both product and theme
     * rules so a theme injection order change cannot silently win.
     */
    const CSS = `
html:root { --dsw-menu-surface-fill: rgb(248 249 250 / var(--dsh-menu-alpha, .96)) !important; }
html body[data-ds-dark-theme],
html body[data-dshome-dark] { --dsw-menu-surface-fill: rgb(39 50 76 / var(--dsh-menu-alpha, .96)) !important; }

html body :has(> [class*="_headerLeading"]):has([class*="_headerActions"])::before {
  background: rgb(13 30 60 / var(--dsh-header-alpha, 0)) !important;
}
html body:not([data-dshome-dark]):not([data-ds-dark-theme]) :has(> [class*="_headerLeading"]):has([class*="_headerActions"])::before {
  background: rgb(255 255 255 / var(--dsh-header-alpha, 0)) !important;
}
html body :has(> [class*="_headerLeading"]):has([class*="_headerActions"]):hover::before {
  background: rgb(13 30 60 / var(--dsh-header-hover-alpha, .45)) !important;
}
html body:not([data-dshome-dark]):not([data-ds-dark-theme]) :has(> [class*="_headerLeading"]):has([class*="_headerActions"]):hover::before {
  background: rgb(255 255 255 / var(--dsh-header-hover-alpha, .45)) !important;
}
`;

    function ensureStyle() {
      let style = document.querySelector("style[data-dsh-menu-opacity]");
      if (style === null) {
        style = document.createElement("style");
        style.dataset.dshMenuOpacity = "";
        style.textContent = CSS;
        document.head.appendChild(style);
      }
      applyMenuAlpha(readNumber(MENU_KEY, MENU_DEFAULT, MENU_MIN, MENU_MAX));
      applyHeaderAlpha(readNumber(HEADER_KEY, HEADER_DEFAULT, HEADER_MIN, HEADER_MAX));
    }

    const labelStyle = { margin: 0, fontSize: 14, fontWeight: 500, lineHeight: "22px" };
    const hintStyle = { margin: 0, fontSize: 12, lineHeight: "18px", color: "var(--dsw-alias-label-tertiary)" };
    const valueStyle = {
      minWidth: 48,
      textAlign: "right",
      fontSize: 13,
      fontVariantNumeric: "tabular-nums",
      color: "var(--dsw-alias-label-primary)"
    };

    function SliderRow(props) {
      return React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 12 } },
        React.createElement("input", {
          type: "range",
          min: props.min,
          max: props.max,
          step: 1,
          value: props.value,
          "aria-label": props.label,
          onChange: (event) => props.onChange(Number(event.target.value)),
          style: { flex: 1, accentColor: "var(--ds-brand, #059669)" }
        }),
        React.createElement("span", { style: valueStyle }, `${props.value}%`)
      );
    }

    function OpacitySection() {
      const [menu, setMenu] = React.useState(() =>
        readNumber(MENU_KEY, MENU_DEFAULT, MENU_MIN, MENU_MAX)
      );
      const [header, setHeader] = React.useState(() =>
        readNumber(HEADER_KEY, HEADER_DEFAULT, HEADER_MIN, HEADER_MAX)
      );

      React.useEffect(() => {
        applyMenuAlpha(menu);
      }, [menu]);

      React.useEffect(() => {
        applyHeaderAlpha(header);
      }, [header]);

      const updateMenu = (next) => {
        const value = clamp(next, MENU_MIN, MENU_MAX);
        setMenu(value);
        writeNumber(MENU_KEY, value);
        applyMenuAlpha(value);
      };

      const updateHeader = (next) => {
        const value = clamp(next, HEADER_MIN, HEADER_MAX);
        setHeader(value);
        writeNumber(HEADER_KEY, value);
        applyHeaderAlpha(value);
      };

      const reset = () => {
        updateMenu(MENU_DEFAULT);
        updateHeader(HEADER_DEFAULT);
      };

      return React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 18, padding: "4px 0", maxWidth: 620 } },
        React.createElement(
          "h3",
          { style: { margin: 0, fontSize: 16, fontWeight: 500, lineHeight: "24px" } },
          "界面透明度"
        ),
        React.createElement(
          "p",
          { style: { margin: 0, fontSize: 13, lineHeight: "20px", color: "var(--dsw-alias-label-secondary)" } },
          "分别调整浮层菜单和会话顶栏的填充不透明度。玻璃边缘、圆角、阴影和模糊保持原样。"
        ),
        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 8 } },
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 2 } },
            React.createElement("span", { style: labelStyle }, "浮层菜单"),
            React.createElement(
              "span",
              { style: hintStyle },
              "加号菜单、模型选择、权限、会话行菜单。默认 96%。"
            )
          ),
          React.createElement(SliderRow, {
            min: MENU_MIN,
            max: MENU_MAX,
            value: menu,
            label: "浮层菜单不透明度",
            onChange: updateMenu
          })
        ),
        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 8 } },
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 2 } },
            React.createElement("span", { style: labelStyle }, "会话顶栏"),
            React.createElement(
              "span",
              { style: hintStyle },
              "0% 保持主题的透明顶栏；调高后静止状态加实底，悬停时至少保留 45% 玻璃。"
            )
          ),
          React.createElement(SliderRow, {
            min: HEADER_MIN,
            max: HEADER_MAX,
            value: header,
            label: "会话顶栏不透明度",
            onChange: updateHeader
          })
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
            `恢复默认（菜单 ${MENU_DEFAULT}% / 顶栏 ${HEADER_DEFAULT}%）`
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
            label: () => "界面透明度",
            inject: () => ({})
          },
          OpacitySection
        )
      );
    }

    exports.apply = apply;
    exports.inject = ["slots"];
    return module.exports;
  }
});
