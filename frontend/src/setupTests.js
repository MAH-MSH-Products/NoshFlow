import '@testing-library/jest-dom';

const localStorageMock = (function () {
    let store = {};
    return {
        getItem(key) {
            return store[key] || null;
        },
        setItem(key, value) {
            store[key] = value.toString();
        },
        removeItem(key) {
            delete store[key];
        },
        clear() {
            store = {};
        }
    };
})();

// تعریف آن در آبجکت global تا در تمام تست‌ها در دسترس باشد
Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
});