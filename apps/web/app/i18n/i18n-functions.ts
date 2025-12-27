'use client';

import { useTranslation } from "react-i18next";
import { I18N_NAMESPACE_WEB } from "./constants";

/**
 * Custom hook that wraps useTranslation with the default web namespace
 * @returns Translation function and i18n instance with I18N_NAMESPACE_WEB as default namespace
 */
export function useWebTranslation() {
    return useTranslation(I18N_NAMESPACE_WEB);
}

