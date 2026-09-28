import React from 'react';

export interface UpdatePromptProps {
  pwaInstallUrl?: string;
}

/**
 * UpdatePrompt feature has been removed as per user request.
 * Returns null so no update modal or overlay is rendered.
 */
export function UpdatePrompt(_props?: UpdatePromptProps) {
  return null;
}
