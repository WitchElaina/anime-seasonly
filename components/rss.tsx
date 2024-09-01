'use client';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Link } from '@nextui-org/link';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/table';
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '@nextui-org/spinner';
import { Autocomplete, AutocompleteItem } from '@nextui-org/autocomplete';

import { SearchIcon } from './icons/search';

const getPikPakURL = (mikanLink: string) => {
  const id = mikanLink.split('/').pop();

  return `https://mypikpak.com/drive/url-checker?url=magnet:?xt.1=urn:btih:${id}`;
};

export function RSSForm() {
  const [url, setUrl] = useState(
    'https://mikanani.me/RSS/MyBangumi?token=MM8ZzG77W8njX0XmMkbgDA%3d%3d',
  );
  const [data, setData] = useState<any>(null);
  const [filterValue, setFilterValue] = useState('Baha to 21');
  const [loading, setLoading] = useState(false);
  const [myRSS, setMyRSS] = useState<{ label: string; value: string }[]>([]);
  const [rss, setRSS] = useState(null);

  useEffect(() => {
    fetch('/api/rss/my', {
      method: 'GET',
    }).then((res) => {
      res.json().then((data) => {
        setMyRSS(
          data.map((rss: any) => ({
            label: rss.label,
            value: rss.url,
          })),
        );
      });
    });
  }, []);

  const onSearchChange = (value: string) => {
    setFilterValue(value);
  };

  const onClear = () => {
    setFilterValue('');
  };

  const parseHandler = () => {
    setLoading(true);
    fetch('/api/rss', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
      }),
    }).then((res) => {
      res
        .json()
        .then((data) => {
          setData(data);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const tableData = useMemo(() => {
    if (!data) return [];

    return data.items.filter((item: any) => {
      if (!filterValue) return true;
      const keywords = filterValue.split(' ');

      return keywords.every((keyword) =>
        item.title.toLowerCase().includes(keyword.toLowerCase()),
      );
    });
  }, [data, filterValue]);

  return (
    <div className="flex flex-col w-full gap-4">
      <h1 className="font-bold text-3xl">Mikan RSS Parser</h1>
      <div className="flex flex-col md:flex-row w-full gap-2">
        <Input
          className="h-full"
          label="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onClear={() => setUrl('')}
        />
        <div className="flex gap-2 w-full">
          <Autocomplete
            allowsCustomValue
            className="h-full"
            label="Select From My RSS"
            selectedKey={rss}
            onSelectionChange={(key) => {
              setUrl(myRSS.find((item) => item.label === key)?.value || '');
              // @ts-ignore
              setRSS(key);
            }}
          >
            {myRSS.map((rssItem) => (
              <AutocompleteItem key={rssItem.label} value={rssItem.label}>
                {rssItem.label}
              </AutocompleteItem>
            ))}
          </Autocomplete>
          <Button className="h-14" color="primary" onClick={parseHandler}>
            Parse
          </Button>
        </div>
      </div>

      <h1 className="font-bold text-xl pt-4">
        {data?.title?.split('-')?.pop() || 'Results'} ({tableData.length})
      </h1>

      <Input
        isClearable
        className="w-full"
        label="Search"
        placeholder="Search by title, split by space for multiple keywords"
        startContent={<SearchIcon />}
        value={filterValue}
        onClear={() => onClear()}
        onValueChange={onSearchChange}
      />

      <div>
        <Table>
          <TableHeader>
            <TableColumn key={'title'}>Title</TableColumn>
            <TableColumn key={'link'}>Link</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={loading}
            loadingContent={<Spinner label="Loading..." />}
          >
            {tableData.map((item: any, index: number) => (
              <TableRow key={`${Date.now()}-${index}`}>
                <TableCell>{item?.title}</TableCell>
                <TableCell>
                  <div className="md:flex flex-col md:flex-row gap-4 md:w-max">
                    <Link className="text-green-600" href={item?.torrent}>
                      Download
                    </Link>
                    <Link
                      isExternal
                      showAnchorIcon
                      className="text-mikan"
                      href={item?.link}
                    >
                      Mikan
                    </Link>
                    <Link
                      isExternal
                      showAnchorIcon
                      href={getPikPakURL(item?.link)}
                    >
                      PikPak
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
