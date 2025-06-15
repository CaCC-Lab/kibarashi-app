import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-secondary border-t border-primary-100 mt-auto dark:bg-gray-800 dark:border-gray-700">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-text-secondary">
          <p>© 2025 5分気晴らし - ストレスフリーな毎日を</p>
          <p className="mt-2">
            <a
              href="/privacy"
              className="hover:text-primary-500 transition-colors duration-200 focus-ring rounded"
            >
              プライバシーポリシー
            </a>
            <span className="mx-2 text-text-muted">|</span>
            <a
              href="/terms"
              className="hover:text-primary-500 transition-colors duration-200 focus-ring rounded"
            >
              利用規約
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;