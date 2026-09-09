import AppearancePage from "../appearance/page"
import StoreDetailsPage from "../store-details/page"
import NavigationPage from "../navigation/page"

export default function SettingsPage() {
    return (
        <div className="space-y-10 pb-10">
            <AppearancePage />
            <StoreDetailsPage />
            <NavigationPage />
        </div>
    )
}