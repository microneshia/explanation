/* ================================================================== */
/* 没入型コンテンツ用フローティングナビゲーションメニューのスクリプト     */
/* ================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const menuToggleIcon = document.getElementById('menu-toggle-icon');
    const floatingMenu = document.getElementById('floating-menu');

    if (menuToggleIcon && floatingMenu) {
        menuToggleIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            floatingMenu.classList.toggle('show');
        });

        document.addEventListener('click', (event) => {
            if (floatingMenu.classList.contains('show')) {
                if (!menuToggleIcon.contains(event.target) && !floatingMenu.contains(event.target)) {
                    floatingMenu.classList.remove('show');
                }
            }
        });
    }
});