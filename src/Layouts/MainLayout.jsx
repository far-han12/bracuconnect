import {Outlet} from "react-router-dom"
const MainLayout = () => {
    return (
        <div className="font-merriweather mx-auto">
            <Outlet></Outlet>
        </div>
    );
};

export default MainLayout;