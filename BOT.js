const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const token = '7507308884:AAHCQzy4zXtjyobrVMvheDHpHcjr9uOSEk8';
const bot = new TelegramBot(token, {polling: true});
let valid = 0;
let invalid = 0;
let sessionId = '';
let isChecking = false;
let checkInterval;
let proxies = [];
let users = [];
try {
    proxies = fs.readFileSync('proxies.txt', 'utf-8').split('\n').filter(p => p.trim());
    users = fs.readFileSync('users.txt', 'utf-8').split('\n').filter(u => u.trim());
} catch (err) {
    console.error('Error reading files:', err);
}
const mainMenu = {
    reply_markup: {
        keyboard: [
            [{text: '🔍 Periksa Nama Pengguna'}, {text: '⏹ Berhenti Memeriksa'}],
            [{text: '📊 Stats'}, {text: 'ℹ️ Help'}]
        ],
        resize_keyboard: true
    }
};
const roundButtonMenu = {
    reply_markup: {
        inline_keyboard: [
            [{text: 'Start Checker', callback_data: 'start_checker'}],
            [{text: 'View Stats', callback_data: 'view_stats'}],
            [{text: 'Help', callback_data: 'help'}]
        ]
    }
};
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMsg = `👰*HI KAK LORDHOZOO IMUT* 👰\n\n` +
                      `Bot ini memeriksa ketersediaan nama pengguna TikTok.\n\n` +
                      `AUTHOR : LORDHOZOO`;
    bot.sendPhoto(chatId, 'https://example.com/bot-image.jpg', {
        caption: welcomeMsg,
        parse_mode: 'Markdown',
        ...roundButtonMenu
    });
});
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    if (data === 'start_checker') {
        bot.sendMessage(chatId, 'Silakan kirim ID sesi TikTok Anda untuk mulai memeriksa:', {
            reply_markup: {
                force_reply: true
            }
        });
    } else if (data === 'view_stats') {
        bot.sendMessage(chatId, `📊 *Statistik Saat Ini*\n\n✅ Sah: ${valid}\n❌ Tidak sah: ${invalid}`, {
            parse_mode: 'Markdown'
        });
    } else if (data === 'help') {
        sendHelpMessage(chatId);
    }
});
bot.on('text', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (text === '🔍 Periksa Nama Pengguna') {
        bot.sendMessage(chatId, 'Silakan kirim ID sesi TikTok Anda untuk mulai memeriksa:', {
            reply_markup: {
                force_reply: true
            }
        });
    } else if (text === '⏹ Berhenti Memeriksa') {
        stopChecking(chatId);
    } else if (text === '📊 Statistik') {
        bot.sendMessage(chatId, `📊 *Statistik Saat Ini*\n\n✅ Valid: ${valid}\n❌ Tidak sah: ${invalid}`, {
            parse_mode: 'Markdown',
            ...mainMenu
        });
    } else if (text === 'ℹ️ Help') {
        sendHelpMessage(chatId);
    } else if (msg.reply_to_message && msg.reply_to_message.text === 'Silakan kirim ID sesi TikTok Anda untuk mulai memeriksa:') {
        sessionId = text.trim();
        startChecking(chatId);
    }
});
function sendHelpMessage(chatId) {
    const helpMsg =`🆘 *Bantuan* 🆘\n\n` +
`1. Kirim ID sesi TikTok Anda saat diminta\n` +
`2. Bot akan mulai memeriksa nama pengguna dari users.txt\n` +
`3. Menggunakan proksi dari proxies.txt\n` +
`4. Lihat statistik kapan saja\n\n` +
`*Perintah:*\n` +
`/start - Tampilkan menu utama\n` +
`/stop - Hentikan pemeriksaan\n` +
`/stats - Tampilkan statistik terkini`;
    bot.sendMessage(chatId, helpMsg, {
        parse_mode: 'Markdown',
        ...mainMenu
    });
}
function startChecking(chatId) {
    if (isChecking) {
        bot.sendMessage(chatId, '❌ Pemeriksa sudah berjalan!', mainMenu);
        return;
    }
    if (!sessionId) {
        bot.sendMessage(chatId, '❌ Tidak ada ID sesi yang disediakan!', mainMenu);
        return;
    }
    if (users.length === 0) {
        bot.sendMessage(chatId, '❌ Tidak ada nama pengguna yang ditemukan di users.txt!', mainMenu);
        return;
    }
    isChecking = true;
    bot.sendMessage(chatId, '✅ Pemeriksa dimulai!', mainMenu);
    checkInterval = setInterval(async () => {
        try {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomProxy = proxies.length > 0 ? proxies[Math.floor(Math.random() * proxies.length)] : null;
            const params = {
                aid: '1988',
                app_language: 'en',
                app_name: 'tiktok_web',
                battery_info: '1',
                browser_language: 'en-US',
                browser_name: 'Mozilla',
                browser_online: 'true',
                browser_platform: 'Win32',
                browser_version: '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.54',
                channel: 'tiktok_web',
                cookie_enabled: 'true',
                device_id: '7102861260652692998',
                device_platform: 'web_pc',
                focus_state: 'true',
                from_page: 'user',
                history_len: '3',
                is_fullscreen: 'false',
                is_page_visible: 'true',
                os: 'windows',
                priority_region: 'BE',
                referer: '',
                region: 'BE',
                screen_height: '1080',
                screen_width: '1920',
                tz_name: 'Europe/Brussels',
                unique_id: randomUser,
                webcast_language: 'en',
                msToken: 'nTSQ3aga4re71sf6jxx7S00JXIPzeg-4sHemEVntF8SXluh5obYrch86ZH9wTvRCumbcXrx8snSk15zGwDB81VW55SD0v1psJ_51k1InI8qxCtUe0mKMF2jaKfi00MVSctUpG6c1',
                'X-Bogus': 'DFSzswVLYlTANyxdSMSB0sXyYJWn',
                '_signature': '_02B4Z6wo00001Qz7WXAAAIDAL1p33MaqfyEM-13AACB3bc',
            };
            const options = {
                headers: {
                    'authority': 'www.tiktok.com',
                    'accept': '*/*',
                    'accept-language': 'en-US,en;q=0.9',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.54',
                },
                params: params,
                proxy: randomProxy ? {
                    host: randomProxy.split(':')[0],
                    port: parseInt(randomProxy.split(':')[1]),
                } : null
            };
            const response = await axios.get('https://www.tiktok.com/api/uniqueid/check/', options);
            if (response.data.status_code === 0) {
                valid++;
                bot.sendMessage(chatId, `✅ ${randomUser} TERSEDIA`, mainMenu);
            } else if (response.data.status_code === 3249) {
                invalid++;
                bot.sendMessage(chatId, `❌ ${randomUser} DIAMBIL/DILARANG`, mainMenu);
            }
        } catch (error) {
            console.error('Terjadi kesalahan saat memeriksa nama pengguna:', error);
            bot.sendMessage(chatId, `⚠️ Terjadi kesalahan saat memeriksa nama pengguna: ${error.message}`, mainMenu);
        }
    }, 3000); 
}
function stopChecking(chatId) {
    if (!isChecking) {
        bot.sendMessage(chatId, '❌ Pemeriksa tidak berjalan!', mainMenu);
        return;
    }
    clearInterval(checkInterval);
    isChecking = false;
    bot.sendMessage(chatId, '⏹ Pemeriksa berhenti!', mainMenu);
}
console.log('KAK LORDHOZOO CUTE CANTIK BOT DAH ONLINE ...');
