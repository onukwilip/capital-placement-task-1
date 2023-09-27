import css from "./styles/App.module.scss";
import SideMenu from "./components/SideMenu";
import { Button } from "@mui/material";
import Breadcrumbs from "./components/Breadcrumbs";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <main className={css.app}>
      <div className={css.side_menu_container}>
        <SideMenu />
      </div>
      <div className={css.dashboard_container}>
        <div className={css.action}>
          <Button variant="contained" size="large" color="success">
            <span> Save & continue</span> <i className="fas fa-caret-right" />
          </Button>
        </div>
        <div className={css.breadcrumbs_container}>
          <Breadcrumbs />
        </div>
        <div className={css.action}>
          <span>Save draft</span>
        </div>
        <Dashboard />
      </div>
    </main>
  );
}

export default App;
