/** @odoo-module **/

import { browser } from "@web/core/browser/browser";
import { _t } from "@web/core/l10n/translation";

export const MapLoader = {
    load: async function (rpc) {
        try {
            const apiKey = await rpc('/web/dataset/call_kw/ir.config_parameter/get_param', {
                model: 'ir.config_parameter',
                method: 'get_param',
                args: ['google_map_widget.api_key'],
                kwargs: {},
            });
            
            if (!apiKey) {
                throw new Error(_t("Google Maps API Key not found"));
            }
            
            return new Promise((resolve, reject) => {
                window.initMap = resolve;
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        } catch (error) {
            browser.console.error("Error loading Google Maps:", error);
            throw error;
        }
    },
};