import { Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { CategoryBrowserPage } from '../pages/CategoryBrowserPage';
import { CategoryPage } from '../pages/CategoryPage';
import { ClientDashboardPage } from '../pages/ClientDashboardPage';
import { HowItWorksPage } from '../pages/HowItWorksPage';
import { HomePage } from '../pages/HomePage';
import { ListingDetailPage } from '../pages/ListingDetailPage';
import { ListingsPage } from '../pages/ListingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProviderCreateListingPage } from '../pages/ProviderCreateListingPage';
import { ProviderDashboardPage } from '../pages/ProviderDashboardPage';
import { ProviderProfilePage } from '../pages/ProviderProfilePage';
import { ProvidersPage } from '../pages/ProvidersPage';
import { RequestConfirmationPage } from '../pages/RequestConfirmationPage';
import { RequestDetailPage } from '../pages/RequestDetailPage';
import { RequestPage } from '../pages/RequestPage';
import { RequestReviewPage } from '../pages/RequestReviewPage';
import { RulesPage } from '../pages/RulesPage';
import { ServicesPage } from '../pages/ServicesPage';
import { SubcategoryPage } from '../pages/SubcategoryPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="request" element={<RequestPage />} />
        <Route path="request/review" element={<RequestReviewPage />} />
        <Route path="request/confirmation" element={<RequestConfirmationPage />} />
        <Route path="requests/:id" element={<RequestDetailPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="categories" element={<CategoryBrowserPage />} />
        <Route path="categories/:categorySlug" element={<CategoryPage />} />
        <Route path="categories/:categorySlug/:subcategorySlug" element={<SubcategoryPage />} />
        <Route path="listings" element={<ListingsPage />} />
        <Route path="listings/:listingId" element={<ListingDetailPage />} />
        <Route path="providers" element={<ProvidersPage />} />
        <Route path="providers/:id" element={<ProviderProfilePage />} />
        <Route path="client" element={<ClientDashboardPage />} />
        <Route path="provider" element={<ProviderDashboardPage />} />
        <Route path="provider/create-listing" element={<ProviderCreateListingPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="admin" element={<AdminDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
