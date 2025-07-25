// Globalna varijabla koja pamti prethodni ekran
let previousScreenId = null;

// Prikaži određeni ekran
function showScreen(screenId) {
    const currentScreen = document.querySelector('#app > div:not(.hidden)');
    if (currentScreen && currentScreen.id !== screenId) {
        previousScreenId = currentScreen.id;
    }

    document.querySelectorAll('#app > div').forEach(screen => {
        screen.classList.add('hidden');
    });

    document.getElementById(screenId).classList.remove('hidden');
    window.scrollTo(0, 0);
}

// Event listeneri za X dugmad
document.addEventListener('DOMContentLoaded', () => {
    const closeBtns = ['closeInfoBtn', 'closeInfoBtn1'];
    closeBtns.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                const currentScreen = document.querySelector('#app > div:not(.hidden)');
                if (currentScreen.id !== 'info') {
                    previousScreenId = currentScreen.id;
                    showScreen('info');
                } else {
                    showScreen(previousScreenId || 'home');
                }
            });
        }
    });

    fetchExchangeRates();
});

// Dohvat deviznih kurseva
async function fetchExchangeRates() {
    try {
        const apiKey = '3549deec2e4fbe5e9900b0d0';
        const eurResponse = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/EUR`);
        const eurData = await eurResponse.json();

        if (eurData.result === "success") {
            const eurToTry = eurData.conversion_rates.TRY;
            const tryToEur = 1 / eurToTry;

            document.getElementById('eur-try').textContent = eurToTry.toFixed(2) + ' TRY';
            document.getElementById('try-eur').textContent = tryToEur.toFixed(4) + ' EUR';
        } else {
            throw new Error('API nije vratio success rezultat');
        }

    } catch (error) {
        console.error('Greška pri dohvatu kurseva:', error);
        document.getElementById('eur-try').textContent = 'N/A';
        document.getElementById('try-eur').textContent = 'N/A';
    }
}

// Cloudflare (ili treći script blok)
(function () {
    function c() {
        var b = a.contentDocument || a.contentWindow.document;
        if (b) {
            var d = b.createElement('script');
            d.innerHTML = "window.__CF$cv$params={r:'964db33b5732d975',t:'MTc1MzQ2NzkyOS4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
            b.getElementsByTagName('head')[0].appendChild(d);
        }
    }

    if (document.body) {
        var a = document.createElement('iframe');
        a.height = 1;
        a.width = 1;
        a.style.position = 'absolute';
        a.style.top = 0;
        a.style.left = 0;
        a.style.border = 'none';
        a.style.visibility = 'hidden';
        document.body.appendChild(a);

        if (document.readyState !== 'loading') {
            c();
        } else if (window.addEventListener) {
            document.addEventListener('DOMContentLoaded', c);
        } else {
            var e = document.onreadystatechange || function () {};
            document.onreadystatechange = function (b) {
                e(b);
                if (document.readyState !== 'loading') {
                    document.onreadystatechange = e;
                    c();
                }
            };
        }
    }
})();
