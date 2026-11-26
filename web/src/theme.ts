import type { ThemeConfig } from "antd";

/**
 * 視覺取值單一出處（web-workbench D2）：仿 resolve 工作檯的液態玻璃風格。
 * 顏色只在這裡定義；glass.css 經 `cssVars()` 注入的 `--qz-*` 變量讀本表，兩邊不會各說各話。
 */
export const palette = {
  accent: "#0f7c83",
  accentBright: "#139aa2",
  text: "#1d1d1f",
  text2: "#6e6e73",
  text3: "#86868b",
  hairline: "rgba(60, 60, 67, 0.12)",
  border: "rgba(60, 60, 67, 0.22)",
  pageBg: "#eef2f4",
  surface: "rgba(255, 255, 255, 0.82)",
  fill: "rgba(0, 0, 0, 0.04)",
  accentSoft: "rgba(15, 124, 131, 0.1)",
  danger: "#d7373f",
  warn: "#ff9f0a",
  ok: "#34c759",
  okText: "#248a3d",
  okSoft: "rgba(52, 199, 89, 0.14)",
  dangerSoft: "rgba(215, 55, 63, 0.08)",
  glow: ["#5fb8bd", "#8fc9f0", "#c3b8f5", "#ffe2c6"],
} as const;

const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", "Helvetica Neue", sans-serif';

export const quizTheme: ThemeConfig = {
  token: {
    colorPrimary: palette.accent,
    colorInfo: palette.accent,
    colorLink: palette.accent,
    colorError: palette.danger,
    colorSuccess: palette.okText,
    colorWarning: palette.warn,
    colorText: palette.text,
    colorTextSecondary: palette.text2,
    colorTextTertiary: palette.text3,
    colorTextDescription: palette.text2,
    colorBorderSecondary: palette.hairline,
    colorBgLayout: "transparent",
    borderRadius: 10,
    borderRadiusLG: 20,
    fontFamily: FONT,
    fontSize: 15,
  },
  components: {
    Layout: { headerBg: "transparent", siderBg: "transparent", bodyBg: "transparent", headerHeight: 60 },
    Card: { colorBgContainer: palette.surface, borderRadiusLG: 22, headerFontSize: 17 },
    Menu: { itemBg: "transparent", itemSelectedBg: palette.accentSoft, itemSelectedColor: palette.accent, itemBorderRadius: 10 },
    Table: { headerBg: "rgba(255,255,255,0.6)", rowHoverBg: palette.accentSoft, borderColor: palette.hairline },
    Button: { borderRadius: 10, controlHeight: 36, fontWeight: 500 },
    Input: { borderRadius: 10, controlHeight: 38 },
    Tag: { borderRadiusSM: 999, defaultBg: palette.fill },
    Alert: { borderRadiusLG: 14 },
  },
};

/** 注入 glass.css 讀的 CSS 變量。 */
export function cssVars(): Record<string, string> {
  return {
    "--qz-accent": palette.accent,
    "--qz-accent-bright": palette.accentBright,
    "--qz-text": palette.text,
    "--qz-text2": palette.text2,
    "--qz-hairline": palette.hairline,
    "--qz-page-bg": palette.pageBg,
    "--qz-accent-soft": palette.accentSoft,
    "--qz-ok-text": palette.okText,
    "--qz-ok-soft": palette.okSoft,
    "--qz-danger": palette.danger,
    "--qz-glow-1": palette.glow[0],
    "--qz-glow-2": palette.glow[1],
    "--qz-glow-3": palette.glow[2],
    "--qz-glow-4": palette.glow[3],
  };
}
