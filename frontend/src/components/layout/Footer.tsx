import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600">
          <p>© 2025 5分気晴らし - ストレスフリーな毎日を</p>
          <p className="mt-2">
            <a
              href="/privacy"
              className="hover:text-primary-600 transition-colors"
            >
              プライバシーポリシー
            </a>
            <span className="mx-2">|</span>
            <a
              href="/terms"
              className="hover:text-primary-600 transition-colors"
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