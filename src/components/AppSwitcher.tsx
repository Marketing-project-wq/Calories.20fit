import { SUBDOMAINS, COLORS } from "../lib/constants";

interface AppSwitcherProps {
  currentKey: string;
}

export const AppSwitcher = ({ currentKey }: AppSwitcherProps) => {
  return (
    <div className="grid grid-cols-2 gap-2 md:gap-3">
      {SUBDOMAINS.map((subdomain) => {
        const isActive = subdomain.key === currentKey;
        return (
          <a
            key={subdomain.key}
            href={subdomain.url}
            className="p-3 rounded-lg text-center transition-all hover:bg-gray-100"
            style={{ backgroundColor: isActive ? "#FCEBED" : "transparent" }}
          >
            <div className="text-2xl mb-1">{subdomain.icon}</div>
            <div className="text-xs font-semibold" style={{ color: isActive ? COLORS.RED : "#606060" }}>
              {subdomain.name}
            </div>
          </a>
        );
      })}
    </div>
  );
};
