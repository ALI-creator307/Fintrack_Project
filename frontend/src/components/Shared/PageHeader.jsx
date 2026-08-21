import './Shared.css';

function PageHeader({ title, subtitle, children }) {
    return (
        <div className="page-header">
            <div>
                <h1 className="page-header__title">{title}</h1>
                {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
            </div>
            {children && <div className="page-header__actions">{children}</div>}
        </div>
    );
}

export default PageHeader;
