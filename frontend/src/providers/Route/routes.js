import Home from '../../pages/Home/Home.js';
import Quiz from '../../pages/Quiz/Quiz.js';

const routes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/quiz/:id',
    element: <Quiz />,
  },
];

export default routes;
