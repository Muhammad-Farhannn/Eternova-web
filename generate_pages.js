const fs = require('fs');
const index = fs.readFileSync('index.html', 'utf8');

const headMatch = index.match(/[\s\S]*?<body[^>]*>/);
const head = headMatch[0];

const headerMatch = index.match(/<header[\s\S]*?<\/header>/);
let header = headerMatch[0];

// In the header, change the "User" or login link if it doesn't exist, we'll add one.
// Let's add a User icon next to the Cart icon
if (!header.includes('>person<')) {
    header = header.replace(
        '<button id="cart-btn"',
        '<button id="user-btn" aria-label="Profile" onclick="window.location.href=\'login.html\'" class="hover:text-tertiary transition-colors group mr-2 sm:mr-4 md:mr-6">\n<span class="material-symbols-outlined text-[20px] md:text-[24px] group-hover:scale-110 transition-transform">person</span>\n</button>\n<button id="cart-btn"'
    );
}

// Write the modified index.html back
const updatedIndex = index.replace(/<header[\s\S]*?<\/header>/, header);
fs.writeFileSync('index.html', updatedIndex);

const footerMatch = index.match(/<footer[\s\S]*?<\/html>/);
const footer = footerMatch[0];

const buildPage = (title, bodyContent) => {
    return head.replace('<title>Scroll Animation & Eternova</title>', '<title>' + title + ' - Eternova</title>') + 
           '\n' + header + '\n' + 
           '<main class="pt-32 pb-16 min-h-screen flex items-center justify-center bg-background">\n' + 
           bodyContent + 
           '\n</main>\n' + 
           footer;
};

const loginBody = `
    <div class="max-w-md w-full mx-auto px-margin-mobile bg-surface-container-low p-8 rounded-xl border border-outline-variant/20 shadow-lg">
        <div class="text-center mb-8">
            <h1 class="font-headline-lg text-3xl text-primary mb-2">Welcome Back</h1>
            <p class="font-body-md text-on-surface-variant">Sign in to continue to Eternova.</p>
        </div>
        <form id="login-form" class="space-y-6">
            <div id="error-msg" class="hidden bg-error-container text-on-error p-3 rounded-lg text-sm font-body-sm"></div>
            <div>
                <label class="block font-label-caps text-label-caps text-primary mb-2">Email</label>
                <input type="email" id="email" required class="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-tertiary transition-colors" placeholder="your@email.com">
            </div>
            <div>
                <label class="block font-label-caps text-label-caps text-primary mb-2">Password</label>
                <input type="password" id="password" required class="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-tertiary transition-colors" placeholder="••••••••">
            </div>
            <button type="submit" id="submit-btn" class="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 rounded-full hover:bg-tertiary hover:text-black transition-all duration-300 uppercase tracking-widest mt-2">
                Sign In
            </button>
        </form>
        <p class="mt-6 text-center font-body-sm text-on-surface-variant">
            Don't have an account? <a href="signup.html" class="text-primary hover:text-tertiary hover:underline underline-offset-4 transition-colors">Create one</a>
        </p>
    </div>
    <script>
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('error-msg');
            const submitBtn = document.getElementById('submit-btn');
            
            submitBtn.textContent = 'Signing in...';
            submitBtn.disabled = true;
            
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                
                if (data.success) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'profile.html';
                } else {
                    errorMsg.textContent = data.message || 'Login failed';
                    errorMsg.classList.remove('hidden');
                }
            } catch (err) {
                errorMsg.textContent = 'A network error occurred.';
                errorMsg.classList.remove('hidden');
            } finally {
                submitBtn.textContent = 'Sign In';
                submitBtn.disabled = false;
            }
        });
        
        // If already logged in, redirect to profile
        if (localStorage.getItem('token')) {
            window.location.href = 'profile.html';
        }
    </script>
`;

const signupBody = `
    <div class="max-w-md w-full mx-auto px-margin-mobile bg-surface-container-low p-8 rounded-xl border border-outline-variant/20 shadow-lg my-12">
        <div class="text-center mb-8">
            <h1 class="font-headline-lg text-3xl text-primary mb-2">Create Account</h1>
            <p class="font-body-md text-on-surface-variant">Join Eternova for exclusive benefits.</p>
        </div>
        <form id="signup-form" class="space-y-6">
            <div id="error-msg" class="hidden bg-error-container text-on-error p-3 rounded-lg text-sm font-body-sm"></div>
            <div>
                <label class="block font-label-caps text-label-caps text-primary mb-2">Full Name</label>
                <input type="text" id="name" required class="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-tertiary transition-colors" placeholder="Jane Doe">
            </div>
            <div>
                <label class="block font-label-caps text-label-caps text-primary mb-2">Email</label>
                <input type="email" id="email" required class="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-tertiary transition-colors" placeholder="your@email.com">
            </div>
            <div>
                <label class="block font-label-caps text-label-caps text-primary mb-2">Password</label>
                <input type="password" id="password" required minlength="6" class="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-tertiary transition-colors" placeholder="••••••••">
            </div>
            <button type="submit" id="submit-btn" class="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 rounded-full hover:bg-tertiary hover:text-black transition-all duration-300 uppercase tracking-widest mt-2">
                Create Account
            </button>
        </form>
        <p class="mt-6 text-center font-body-sm text-on-surface-variant">
            Already have an account? <a href="login.html" class="text-primary hover:text-tertiary hover:underline underline-offset-4 transition-colors">Sign in</a>
        </p>
    </div>
    <script>
        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('error-msg');
            const submitBtn = document.getElementById('submit-btn');
            
            submitBtn.textContent = 'Creating...';
            submitBtn.disabled = true;
            
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await res.json();
                
                if (data.success) {
                    if (data.token) localStorage.setItem('token', data.token);
                    window.location.href = 'profile.html';
                } else {
                    errorMsg.textContent = data.message || 'Registration failed';
                    errorMsg.classList.remove('hidden');
                }
            } catch (err) {
                errorMsg.textContent = 'A network error occurred.';
                errorMsg.classList.remove('hidden');
            } finally {
                submitBtn.textContent = 'Create Account';
                submitBtn.disabled = false;
            }
        });
        
        // If already logged in, redirect to profile
        if (localStorage.getItem('token')) {
            window.location.href = 'profile.html';
        }
    </script>
`;

const profileBody = `
    <div class="max-w-4xl w-full mx-auto px-margin-mobile">
        <div class="mb-8 flex justify-between items-end">
            <div>
                <h1 class="font-headline-lg text-4xl md:text-5xl text-primary mb-2">My Profile</h1>
                <p class="font-body-md text-on-surface-variant">Manage your personal information.</p>
            </div>
            <button id="logout-btn" class="font-label-caps text-label-caps text-error border border-error/50 px-6 py-2 rounded-full hover:bg-error/10 transition-colors uppercase tracking-widest">
                Logout
            </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-1 space-y-4">
                <div class="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 shadow-sm">
                    <h3 class="font-label-caps text-label-caps text-tertiary mb-6 uppercase tracking-widest border-b border-outline-variant/20 pb-2">Navigation</h3>
                    <div class="space-y-4 flex flex-col">
                        <a href="#" class="font-body-md text-primary hover:text-tertiary transition-colors">Personal Info</a>
                        <a href="#" class="font-body-md text-on-surface-variant hover:text-tertiary transition-colors">Addresses</a>
                        <a href="#" class="font-body-md text-on-surface-variant hover:text-tertiary transition-colors">Order History</a>
                    </div>
                </div>
            </div>
            
            <div class="md:col-span-2 space-y-8">
                <!-- Personal Info -->
                <div class="bg-surface-container-low p-6 md:p-8 rounded-xl border border-outline-variant/20 shadow-lg">
                    <h2 class="font-headline-md text-2xl text-primary mb-6">Personal Information</h2>
                    <form id="profile-form" class="space-y-6">
                        <div id="profile-msg" class="hidden p-3 rounded-lg text-sm font-body-sm"></div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block font-label-caps text-label-caps text-primary mb-2">Full Name</label>
                                <input type="text" id="profile-name" required class="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-tertiary transition-colors">
                            </div>
                            <div>
                                <label class="block font-label-caps text-label-caps text-primary mb-2">Email Address</label>
                                <input type="email" id="profile-email" disabled class="w-full bg-surface-container/50 border border-outline-variant/10 rounded-lg px-4 py-3 text-on-surface-variant cursor-not-allowed">
                                <p class="text-[11px] text-on-surface-variant mt-1 opacity-70">Email cannot be changed.</p>
                            </div>
                            <div>
                                <label class="block font-label-caps text-label-caps text-primary mb-2">Phone Number</label>
                                <input type="tel" id="profile-phone" class="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-tertiary transition-colors" placeholder="+1 (555) 000-0000">
                            </div>
                        </div>
                        
                        <div class="pt-4 border-t border-outline-variant/20 flex justify-end">
                            <button type="submit" id="save-profile-btn" class="bg-primary text-on-primary font-label-caps text-label-caps px-8 py-3 rounded-full hover:bg-tertiary hover:text-black transition-all duration-300 uppercase tracking-widest">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <script>
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
        }
        
        async function loadProfile() {
            try {
                const res = await fetch('/api/auth/me', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                const data = await res.json();
                
                if (data.success) {
                    document.getElementById('profile-name').value = data.user.name || '';
                    document.getElementById('profile-email').value = data.user.email || '';
                    document.getElementById('profile-phone').value = data.user.phone || '';
                } else {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                }
            } catch (err) {
                console.error(err);
            }
        }
        
        loadProfile();
        
        document.getElementById('profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('profile-name').value;
            const phone = document.getElementById('profile-phone').value;
            const msgEl = document.getElementById('profile-msg');
            const btn = document.getElementById('save-profile-btn');
            
            btn.textContent = 'Saving...';
            btn.disabled = true;
            
            try {
                const res = await fetch('/api/user/profile', {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ name, phone })
                });
                const data = await res.json();
                
                msgEl.classList.remove('hidden', 'bg-error-container', 'text-on-error');
                msgEl.classList.add('bg-tertiary/20', 'text-tertiary');
                
                if (data.success) {
                    msgEl.textContent = 'Profile updated successfully!';
                } else {
                    msgEl.classList.remove('bg-tertiary/20', 'text-tertiary');
                    msgEl.classList.add('bg-error-container', 'text-on-error');
                    msgEl.textContent = data.message || 'Failed to update profile';
                }
            } catch (err) {
                msgEl.classList.remove('hidden', 'bg-tertiary/20', 'text-tertiary');
                msgEl.classList.add('bg-error-container', 'text-on-error');
                msgEl.textContent = 'A network error occurred.';
            } finally {
                btn.textContent = 'Save Changes';
                btn.disabled = false;
            }
        });
        
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    </script>
`;

fs.writeFileSync('login.html', buildPage('Login', loginBody));
fs.writeFileSync('signup.html', buildPage('Create Account', signupBody));
fs.writeFileSync('profile.html', buildPage('My Profile', profileBody));
