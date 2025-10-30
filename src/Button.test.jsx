import { render, screen, fireEvent } from "@testing-library/react";

import React from 'react'
import Navbar from "./components/layout/Navbar";

test('renders navbar and handles  click', () => {
    render(<Navbar />);
     
})
