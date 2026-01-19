import CustomerLayout from "../layouts/CustomerLayout/CustomerLayout";
import HomePage from "@/pages/Customer/Home/HomePage";

const customerRoutes = [
    {
        path: "/",
        element: (
            <CustomerLayout>
                <HomePage />
            </CustomerLayout>
        ),
    }
];

export default customerRoutes;