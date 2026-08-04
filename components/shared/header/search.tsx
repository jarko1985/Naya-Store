import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllCategoriesFlat } from '@/lib/actions/category.actions';
import { SearchIcon } from 'lucide-react';
import SearchSuggestionsInput from '@/components/shared/search/search-suggestions-input';

const Search = async () => {
  const categories = await getAllCategoriesFlat();

  return (
    <form action='/search' method='GET'>
      <div className='flex w-full max-w-xl items-center space-x-2'>
        <Select name='category'>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='All' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key='All' value='all'>
              All
            </SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.parentId ? `— ${c.name}` : c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SearchSuggestionsInput />
        <Button>
          <SearchIcon />
        </Button>
      </div>
    </form>
  );
};

export default Search;