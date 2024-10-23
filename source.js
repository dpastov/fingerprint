async function getEnhancedFingerprint() {
    // Helper functions to gather various attributes
    function getPlugins() {
        if (navigator.plugins) {
            return Array.from(navigator.plugins).map(plugin => plugin.name).join(', ');
        }
        return 'No plugins';
    }

    function getTouchCapabilities() {
        return {
            maxTouchPoints: navigator.maxTouchPoints,
            touchEventSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0
        };
    }

    function getCanvasFingerprint() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.textBaseline = 'top';
        context.font = '14px Arial';
        context.fillText('Browser fingerprinting', 2, 4);
        return canvas.toDataURL();
    }

    function detectFonts() {
        const baseFonts = ['monospace', 'sans-serif', 'serif'];
        const testString = 'mmmmmmmmmmlli';
        const defaultWidth = {};
        const defaultHeight = {};
        const fonts = ['Arial', 'Courier New', 'Times New Roman'];
        const detectedFonts = [];

        const span = document.createElement('span');
        span.style.fontSize = '72px';
        span.innerHTML = testString;
        document.body.appendChild(span);

        for (let i = 0; i < baseFonts.length; i++) {
            span.style.fontFamily = baseFonts[i];
            defaultWidth[baseFonts[i]] = span.offsetWidth;
            defaultHeight[baseFonts[i]] = span.offsetHeight;
        }

        for (let i = 0; i < fonts.length; i++) {
            for (let j = 0; j < baseFonts.length; j++) {
                span.style.fontFamily = fonts[i] + ',' + baseFonts[j];
                if (span.offsetWidth !== defaultWidth[baseFonts[j]] || span.offsetHeight !== defaultHeight[baseFonts[j]]) {
                    detectedFonts.push(fonts[i]);
                    break;
                }
            }
        }

        document.body.removeChild(span);
        return detectedFonts.join(', ');
    }

    function getWebGLInfo() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (!gl) return { renderer: '', vendor: '' };
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return {
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        };
    }

    async function getMediaDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.map(device => ({
                deviceId: device.deviceId,
                kind: device.kind,
                label: device.label
            }));
        } catch (error) {
            console.error('Error accessing media devices:', error);
            return []; // Return an empty array if there's an error
        }
    }

    async function getBatteryInfo() {
        if (navigator.getBattery) {
            const battery = await navigator.getBattery();
            return {
                charging: battery.charging,
                level: battery.level,
                chargingTime: battery.chargingTime,
                dischargingTime: battery.dischargingTime
            };
        }
        return {};
    }

    function getStorageInfo() {
        return {
            localStorageSupported: typeof window.localStorage !== 'undefined',
            sessionStorageSupported: typeof window.sessionStorage !== 'undefined'
        };
    }

    function areCookiesEnabled() {
        return navigator.cookieEnabled;
    }

    function getDeviceSpecs() {
        return {
            cores: navigator.hardwareConcurrency || 'unknown',
            memory: navigator.deviceMemory || 'unknown'
        };
    }

    // Simple hash function for fingerprinting
    function hashFingerprint(fingerprint) {
        const string = JSON.stringify(fingerprint);
        let hash = 0, i, chr;
        for (i = 0; i < string.length; i++) {
            chr = string.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString();
    }

    // Collect fingerprint data
    const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: navigator.platform,
        plugins: getPlugins(),
        canvasFingerprint: getCanvasFingerprint(),
        touchSupport: getTouchCapabilities(),
        fonts: detectFonts(),
        webGL: getWebGLInfo(),
        mediaDevices: await getMediaDevices(),
        batteryInfo: await getBatteryInfo(),
        storage: getStorageInfo(),
        cookiesEnabled: areCookiesEnabled(),
        deviceSpecs: getDeviceSpecs()
    };

    return hashFingerprint(fingerprint);
}

// Example usage
getEnhancedFingerprint().then(fingerprint => console.log(fingerprint)).catch(error => console.error('Fingerprinting error:', error));
