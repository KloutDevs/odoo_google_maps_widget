/** @odoo-module **/

/*
 *    Copyright (C) 2024 Nahuel Schmidt
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { browser } from "@web/core/browser/browser";
import { _t } from "@web/core/l10n/translation";

export const MapLoader = {
    googleMapsPromise: null,

    load: async function (rpc) {
        if (this.googleMapsPromise) {
            return this.googleMapsPromise;
        }

        this.googleMapsPromise = (async () => {
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
                
                await this.loadGoogleMapsScript(apiKey);
                return window.google;
            } catch (error) {
                browser.console.error("Error loading Google Maps:", error);
                throw error;
            }
        })();

        return this.googleMapsPromise;
    },

    loadGoogleMapsScript: function(apiKey) {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve(window.google);
                return;
            }

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=initGoogleMaps`;
            script.async = true;
            script.defer = true;

            window.initGoogleMaps = () => {
                resolve(window.google);
                delete window.initGoogleMaps;
            };

            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
};