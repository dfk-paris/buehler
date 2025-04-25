require 'csv'
require 'json'

require 'faraday'
require 'roo'

begin
  require 'pry'
rescue LoadError => e
end

class Buehler::Import
  def run
    records
    translations
  end

  def records
    csv = CSV.open('data/records.csv',
      headers: true,
      return_headers: false,
      col_sep: '|'
    )

    records = []

    csv.each do |row|
      record = row.to_h.compact

      if dp = dfk_persons[record['Wikidata ID']]
        record['dfk_id'] = dp['dfk_id']
      end

      record['letter'] = record['Name'][0].downcase

      records << record
    end

    translations = {'de' => {}, 'en' => {}, 'fr' => {}}
    # TODO

    File.open './frontend/public/records.json', 'w' do |f|
      f.write JSON.pretty_generate(records)
    end

    File.open './frontend/public/translations.json', 'w' do |f|
      f.write JSON.pretty_generate(translations)
    end
  end

  def translations
    data = {}

    Dir['data/translations.*.xlsx'].each do |file|
      puts "using translations from #{file}"

      xlsx = Roo::Spreadsheet.open(file)
      sheet = xlsx.sheet(0)
      headers = sheet.row(2)

      (3..sheet.last_row).each do |i|
        row = headers.zip(sheet.row(i)).to_h
        id = row.delete('id')

        row.each do |locale, v|
          data[locale] ||= {}
          data[locale][id] = v
        end
      end
    end

    File.open 'frontend/public/translations.json', 'w' do |f|
      f.write JSON.pretty_generate(data)
    end
  end


  protected

    def dfk_persons
      @dfk_persons ||= begin
        response = Faraday.get('https://static.dfk-paris.org/dfk_persons/entities.json')
        data = JSON.parse(response.body)

        lookup = {}
        data['records'].each do |record|
          qid = record['wikidata_id']
          next unless qid

          lookup[qid] = record
        end
        lookup
      end
    end
end
