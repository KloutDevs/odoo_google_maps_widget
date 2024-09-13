/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";
import { CharField } from "@web/views/fields/char/char_field";
import { useRef, useState, onMounted, onWillUnmount } from "@odoo/owl";
import { registry } from "@web/core/registry";

export class GoogleMapsWidget extends CharField {
    setup() {
        super.setup();
        this.orm = useService('orm');
        this.mapContainerRef = useRef('mapContainer');
        this.inputRef = useRef('addressInput');
        this.state = useState({
            latitude: -27.3963033,
            longitude: -55.9657155,
            address: '',
            currentMarker: null,
        });
        this.map = null;
        this.autocomplete = null;
        onMounted(() => {
            this._initializeMap();
            this._initializeAutocomplete();
        });
        onWillUnmount(() => {
            if (this.autocomplete) {
                google.maps.event.clearInstanceListeners(this.autocomplete);
            }
        });
    }

    async _initializeMap() {
        const mapContainer = this.mapContainerRef.el;
        if (!mapContainer) {
            console.error('Map container not found.');
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

        this.state.currentMarker = new google.maps.Marker({
            position: { lat: this.state.latitude, lng: this.state.longitude },
            map: this.map,
            title: 'Selected Location'
        });

        this.map.addListener('click', async (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            await this._updateLocation(lat, lng);
        });
    }

    _initializeAutocomplete() {
        const input = this.inputRef.el;
        console.log(input);
        if (!input) {
            console.error('Address input not found.');
            return;
        }

        this.autocomplete = new google.maps.places.Autocomplete(input, {
            types: ['geocode'],
            fields: ['address_components', 'geometry', 'name'],
            componentRestrictions: { country: 'ar' }, // Restrict to Argentina
        });

        this.autocomplete.addListener('place_changed', () => {
            const place = this.autocomplete.getPlace();
            console.log('Selected place:', place);
            if (!place.geometry || !place.geometry.location) {
                console.error("No details available for input: '" + place.name + "'");
                return;
            }

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            this._updateLocation(lat, lng, place.name);
        });

        // Add event listener for input changes
        input.addEventListener('input', () => {
            console.log('Input changed:', input.value);
        });
    }

    async _updateLocation(lat, lng, address = null) {
        console.log(`Updating location: ${lat}, ${lng}, ${address}`);
        this.state.latitude = lat;
        this.state.longitude = lng;

        if (!address) {
            try {
                address = await this.getAddressFromLatLng(lat, lng);
            } catch (error) {
                console.error('Error fetching address:', error);
                return;
            }
        }

        await this.updateFieldValue(address);

        if (this.state.currentMarker) {
            this.state.currentMarker.setMap(null);
        }

        this.state.currentMarker = new google.maps.Marker({
            position: { lat, lng },
            map: this.map,
            title: 'Ubicación Seleccionada'
        });

        this.map.setCenter({ lat, lng });
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
        console.log('Updating field value:', value);
        await this.props.record.update({ [this.props.name]: value });
    }

    async _OpenMapview() {
        const { longitude, latitude } = this.state;
        if (latitude && longitude) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
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
    }),
};

registry.category("fields").add("google_maps_widget", googleMapsWidget);