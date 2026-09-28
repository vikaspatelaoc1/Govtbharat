import { MobilePwaCardConfig } from '../types';
import { DEFAULT_PWA_CARD_CONFIG } from '../data/mobileTabsData';

export function applyMobilePwaCardStylesToDOM(config?: MobilePwaCardConfig) {
  if (typeof document === 'undefined') return;
  const cfg = { ...DEFAULT_PWA_CARD_CONFIG, ...(config || {}) };
  
  let styleEl = document.getElementById('GovtBharat-pwa-card-styles') as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'GovtBharat-pwa-card-styles';
    document.head.appendChild(styleEl);
  }

  const cardWidthCss = cfg.cardCustomMaxWidth > 0 
    ? `${cfg.cardCustomMaxWidth}px` 
    : `${cfg.cardWidthPercent}%`;

  const cardMinHeightCss = cfg.cardHeightMode === 'compact' ? '60px'
    : cfg.cardHeightMode === 'standard' ? '76px'
    : cfg.cardHeightMode === 'spacious' ? '92px'
    : cfg.cardHeightMode === 'custom' ? `${cfg.cardMinHeight}px`
    : 'auto';

  const iconRadiusCss = cfg.iconShape === 'circle' ? '9999px'
    : cfg.iconShape === 'squircle' ? '10px'
    : cfg.iconShape === 'square' ? '2px'
    : '6px';

  styleEl.textContent = `
    :root {
      --pwa-card-width: ${cardWidthCss};
      --pwa-card-min-height: ${cardMinHeightCss};
      --pwa-card-pad-y: ${cfg.cardPaddingY}px;
      --pwa-card-pad-x: ${cfg.cardPaddingX}px;
      --pwa-card-radius: ${cfg.cardBorderRadius}px;

      --pwa-card-icon-box-w: ${cfg.iconContainerWidth}px;
      --pwa-card-icon-box-h: ${cfg.iconContainerHeight}px;
      --pwa-card-icon-svg-size: ${cfg.iconGraphicSize}px;
      --pwa-card-icon-radius: ${iconRadiusCss};

      --pwa-col-card-width: ${cfg.columnCardWidthPercent}%;
      --pwa-col-header-icon-w: ${cfg.columnHeaderIconWidth}px;
      --pwa-col-header-icon-h: ${cfg.columnHeaderIconHeight}px;
      --pwa-col-card-radius: ${cfg.columnBorderRadius}px;

      --pwa-card-title-size: ${cfg.cardTitleFontSize}px;
      --pwa-card-meta-size: ${cfg.cardMetaFontSize}px;
    }

    /* Mobile PWA Job Card Styles - Targeted to Mobile View & PWA Standalone Mode */
    .is-pwa-view .pwa-job-card-item,
    .mobile-pwa-active .pwa-job-card-item,
    body.is-mobile-pwa .pwa-job-card-item {
      width: var(--pwa-card-width) !important;
      max-width: var(--pwa-card-width) !important;
      min-height: var(--pwa-card-min-height) !important;
      padding-top: var(--pwa-card-pad-y) !important;
      padding-bottom: var(--pwa-card-pad-y) !important;
      padding-left: var(--pwa-card-pad-x) !important;
      padding-right: var(--pwa-card-pad-x) !important;
      border-radius: var(--pwa-card-radius) !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }

    .pwa-job-card-icon-box {
      display: none !important;
    }

    .is-pwa-view .pwa-job-column-card,
    .mobile-pwa-active .pwa-job-column-card,
    body.is-mobile-pwa .pwa-job-column-card {
      width: var(--pwa-col-card-width) !important;
      border-radius: var(--pwa-col-card-radius) !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }

    .is-pwa-view .pwa-column-header-icon-box,
    .mobile-pwa-active .pwa-column-header-icon-box,
    body.is-mobile-pwa .pwa-column-header-icon-box {
      width: var(--pwa-col-header-icon-w) !important;
      height: var(--pwa-col-header-icon-h) !important;
      min-width: var(--pwa-col-header-icon-w) !important;
      min-height: var(--pwa-col-header-icon-h) !important;
    }

    .is-pwa-view .pwa-job-card-title,
    .mobile-pwa-active .pwa-job-card-title,
    body.is-mobile-pwa .pwa-job-card-title {
      font-size: var(--pwa-card-title-size) !important;
    }

    .is-pwa-view .pwa-job-card-meta,
    .mobile-pwa-active .pwa-job-card-meta,
    body.is-mobile-pwa .pwa-job-card-meta {
      font-size: var(--pwa-card-meta-size) !important;
    }

    /* In small screens (smartphones < 640px), also auto-apply smoothly */
    @media (max-width: 640px) {
      .pwa-job-card-item {
        width: var(--pwa-card-width) !important;
        max-width: var(--pwa-card-width) !important;
        min-height: var(--pwa-card-min-height) !important;
        padding-top: var(--pwa-card-pad-y) !important;
        padding-bottom: var(--pwa-card-pad-y) !important;
        padding-left: var(--pwa-card-pad-x) !important;
        padding-right: var(--pwa-card-pad-x) !important;
        border-radius: var(--pwa-card-radius) !important;
      }
      .pwa-job-card-icon-box {
        display: none !important;
      }
      .pwa-job-column-card {
        width: var(--pwa-col-card-width) !important;
        border-radius: var(--pwa-col-card-radius) !important;
      }
      .pwa-column-header-icon-box {
        width: var(--pwa-col-header-icon-w) !important;
        height: var(--pwa-col-header-icon-h) !important;
        min-width: var(--pwa-col-header-icon-w) !important;
        min-height: var(--pwa-col-header-icon-h) !important;
      }
    }
  `;
}
