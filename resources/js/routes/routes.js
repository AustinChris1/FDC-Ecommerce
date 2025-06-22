import Dashboard from '../components/admin/Dashboard'
import Profile from '../components/admin/Profile'
import Category from '../components/admin/Category'
import ViewCategory from '../components/admin/ViewCategory';

const routes = [
    {path: '/admin', exact: true, name: 'Admin'},
    {path: '/admin/dashboard', exact: true, name: 'Dashboard', component: Dashboard},
    {path: '/admin/category', exact: true, name: 'Category', component: Category},
    {path: '/admin/category/view', exact: true, name: 'ViewCategory', component: ViewCategory},
    {path: '/admin/profile', exact: true, name: 'Profile', component: Profile},
];

export default routes