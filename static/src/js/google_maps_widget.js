/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";
import { CharField } from "@web/views/fields/char/char_field";
import { useRef, useState, onMounted, onWillUnmount } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { MapLoader } from "./google_maps_loader";

export class GoogleMapsWidget extends CharField {
    setup() {
        super.setup();
        this.orm = useService('orm');
        this.rpc = useService('rpc');
        this.mapContainerRef = useRef('mapContainer');
        this.inputRef = useRef('addressInput');

        this.state = useState({
            latitude: null,
            longitude: null,
            address: '',
            currentMarker: null,
        });

        this.map = null;
        this.autocomplete = null;

        onMounted(async () => {
            await this.loadConfigParameters();
            await this.initializeGoogleMaps();
        });
        
        onWillUnmount(() => {
            if (this.autocomplete) {
                google.maps.event.clearInstanceListeners(this.autocomplete);
            }
        });
    }

    async loadConfigParameters() {
        const [defaultLatitude, defaultLongitude, defaultCountry] = await Promise.all([
            this.rpc('/web/dataset/call_kw/ir.config_parameter/get_param', {
                model: 'ir.config_parameter',
                method: 'get_param',
                args: ['google_map_widget.default_latitude'],
                kwargs: {},
            }),
            this.rpc('/web/dataset/call_kw/ir.config_parameter/get_param', {
                model: 'ir.config_parameter',
                method: 'get_param',
                args: ['google_map_widget.default_longitude'],
                kwargs: {},
            }),
            this.rpc('/web/dataset/call_kw/ir.config_parameter/get_param', {
                model: 'ir.config_parameter',
                method: 'get_param',
                args: ['google_map_widget.default_country'],
                kwargs: {},
            }),
        ]);

        this.state.latitude = parseFloat(defaultLatitude) || -27.3963033;
        this.state.longitude = parseFloat(defaultLongitude) || -55.9657155;
        this.defaultCountry = defaultCountry || 'ar';
    }

    async initializeGoogleMaps() {
        try {
            await MapLoader.load(this.rpc);
            await this._initializeMap();
            this._initializeAutocomplete();
        } catch(e) {
            console.error("Error initializing google maps api:", e);
        }
    }

    async _initializeMap() {
        const mapContainer = this.mapContainerRef.el;
        if (!mapContainer) {
            console.error(_t('Map container not found.'));
            return;
        }

        const value = this.props.record.data[this.props.name] || '';
        if (value) {
            await this.getLatLngFromAddress(value);
        }
        this.map = new google.maps.Map(mapContainer, {
            center: { lat: this.state.latitude, lng: this.state.longitude },
            zoom: 13
        });

        this.updateMarker(this.state.latitude, this.state.longitude);

        this.map.addListener('click', async (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            await this._updateLocation(lat, lng);
        });
    }

    _initializeAutocomplete() {
        const input = this.inputRef.el;
        if (!input) {
            console.error(_t('Address input not found.'));
            return;
        }

        this.autocomplete = new google.maps.places.Autocomplete(input, {
            types: ['geocode'],
            fields: ['address_components', 'geometry', 'name'],
            componentRestrictions: { country: this.defaultCountry },
        });

        this.autocomplete.addListener('place_changed', () => {
            const place = this.autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
                console.error(_t("No details available efor input: %s", place.name));
                return;
            }

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            this._updateLocation(lat, lng, place.name);
        });

    }

    async _updateLocation(lat, lng, address = null) {
        console.log(_t('Updating location: %s - %s - %s', lat, lng, address));
        this.state.latitude = lat;
        this.state.longitude = lng;

        if (!address) {
            try {
                address = await this.getAddressFromLatLng(lat, lng);
            } catch (error) {
                console.error(_t('Error fetching address: %s', error));
                return;
            }
        }

        await this.updateFieldValue(address);

        if (this.props.latitudeField) {
            await this.props.record.update({ [this.props.latitudeField]: lat });
        }
        if (this.props.longitudeField) {
            await this.props.record.update({ [this.props.longitudeField]: lng });
        }

        this.updateMarker(lat, lng);

        this.map.setCenter({ lat, lng });
    }

    updateMarker(lat, lng) {
        if (this.state.currentMarker) {
            this.state.currentMarker.setMap(null);
        }

        this.state.currentMarker = new google.maps.Marker({
            position: { lat, lng },
            map: this.map,
            title: _t('Selected Location')
        });
    }

    async getAddressFromLatLng(latitude, longitude) {
        return new Promise((resolve, reject) => {
            const geocoder = new google.maps.Geocoder();
            const latlng = { lat: latitude, lng: longitude };

            geocoder.geocode({ location: latlng }, (results, status) => {
                console.log('Geocode results:', results);
                if (status === "OK" && results[0]) {
                    resolve(results[0].formatted_address);
                } else {
                    reject(status === "OK" ? "No results found" : `Geocoder failed due to: ${status}`);
                }
            });
        });
    }

    async getLatLngFromAddress(address) {
        return new Promise((resolve, reject) => {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: address }, (results, status) => {
                console.log('Geocode results:', results);
                if (status === "OK" && results[0]) {
                    const { lat, lng } = results[0].geometry.location;
                    this.state.latitude = lat();
                    this.state.longitude = lng();
                    resolve({ lat: lat(), lng: lng() });
                } else {
                    reject(status === "OK" ? "No results found" : `Geocoder failed due to: ${status}`);
                }
            });
        });
    }

    async updateFieldValue(value) {
        await this.props.record.update({ [this.props.name]: value });
    }

    async _OpenMapview() {
        const { longitude, latitude } = this.state;
        if (latitude && longitude) {
            window.open(_t('https://www.google.com/maps/search/?api=1&query=%s,%s_blank', latitude, longitude ));
        }
    }
}

GoogleMapsWidget.template = 'GoogleMapsWidget';

export const googleMapsWidget = {
    component: GoogleMapsWidget,
    supportedTypes: ['char'],
    displayName: _t("Google Maps Widget"),
    extractProps: ({ attrs, options }) => ({
        isPassword: attrs.password === "true",
        placeholder: attrs.placeholder,
        latitudeField: attrs.latitude,
        longitudeField: attrs.longitude,
    }),
};

registry.category("fields").add("google_maps_widget", googleMapsWidget);