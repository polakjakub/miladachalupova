/**
 * Component loader — injects shared header and footer into every page.
 * Resolves paths relative to site root regardless of nesting depth.
 */
(function () {
  'use strict';

  /* Determine the root path (e.g. "" or "/site") */
  function rootPath() {
    const base = document.querySelector('base');
    if (base) return base.href.replace(/\/$/, '');
    /* Walk up from current file to find components/ */
    const depth = (window.location.pathname.match(/\//g) || []).length - 1;
    return depth > 0 ? Array(depth).fill('..').join('/') : '.';
  }

  const root = rootPath();

  function load(url, placeholderId) {
    const el = document.getElementById(placeholderId);
    if (!el) return;
    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('Failed to load ' + url);
        return r.text();
      })
      .then(function (html) {
        el.innerHTML = html;
        if (placeholderId === 'header-placeholder') {
          initNav();
        }
      })
      .catch(function (err) {
        console.warn('Component load error:', err);
      });
  }

  function initNav() {
    /* Hamburger toggle */
    const toggle = document.querySelector('.nav-toggle');
    const nav    = document.querySelector('.site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        const open = nav.classList.toggle('open');
        toggle.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open);
      });
    }

    /* Mark active link */
    const links = document.querySelectorAll('.nav-list a');
    const current = window.location.pathname.replace(/\/+$/, '') || '/';
    links.forEach(function (a) {
      const href = new URL(a.href).pathname.replace(/\/+$/, '') || '/';
      if (href === current) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });

    /* Rewrite relative links so they work from any depth */
    const nav2 = document.querySelector('.site-nav');
    if (!nav2) return;
    nav2.querySelectorAll('a[href]').forEach(function (a) {
      const href = a.getAttribute('href');
      if (href.startsWith('/') && root !== '.') {
        a.href = root + href;
      }
    });

    const logo = document.querySelector('.site-logo');
    if (logo && root !== '.') {
      logo.href = root + '/';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    load(root + '/components/header.html', 'header-placeholder');
    load(root + '/components/footer.html', 'footer-placeholder');
  });
})();
