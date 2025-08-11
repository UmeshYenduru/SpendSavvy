
import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFinancial } from '@/context/FinancialContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { resetToMockData } = useFinancial();
  
  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 flex items-center justify-between h-16">
        <div className="flex items-center md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu size={24} />
          </Button>
        </div>
        
        <div className="flex items-center md:ml-auto gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="p-2 border-b">
                <h3 className="font-medium">Notifications</h3>
              </div>
              <div className="py-2">
                <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <p className="text-sm font-medium">Low balance alert</p>
                  <p className="text-xs text-gray-500">Your "Entertainment" budget is nearly spent</p>
                </div>
                <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <p className="text-sm font-medium">Goal milestone reached!</p>
                  <p className="text-xs text-gray-500">You're halfway to your "Vacation Fund" goal</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetToMockData}
            className="text-xs"
          >
            Reset Demo Data
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
